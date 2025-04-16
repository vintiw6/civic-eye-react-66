import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { AlertCategory } from "./AlertCard";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Camera, MapPin, Loader2 } from "lucide-react";

interface FormData {
  title: string;
  description: string;
  category: AlertCategory;
  address: string;
}

const AlertForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "other" as AlertCategory,
      address: "",
    },
  });

  const selectedCategory = watch("category");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      // Mock coordinates - in a real app, use a geocoding service
      const mockCoordinates = {
        lat: 40.7128 + (Math.random() - 0.5) * 10,
        lng: -74.0060 + (Math.random() - 0.5) * 10,
      };
      
      let imageUrl = "";
      
      // Upload image if one was selected
      if (image) {
        const storageRef = ref(storage, `alerts/test/${Date.now()}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }
      
      // Create the alert
      const alertData = {
        title: data.title,
        description: data.description,
        category: data.category,
        location: {
          address: data.address,
          ...mockCoordinates,
        },
        imageUrl: imageUrl || null,
        createdAt: serverTimestamp(),
        createdBy: {
          uid: 'test-user',
          email: 'test@example.com',
        },
      };
      
      await addDoc(collection(db, "alerts"), alertData);
      
      toast({
        title: "Alert posted successfully",
        description: "Your alert has been posted and is now visible to the community.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error posting alert",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Alert Title</Label>
          <Input
            id="title"
            placeholder="Enter a concise title for your alert"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            onValueChange={(value) => setValue("category", value as AlertCategory)}
            defaultValue={selectedCategory}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="crime">Crime</SelectItem>
              <SelectItem value="accident">Accident</SelectItem>
              <SelectItem value="weather">Weather</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Provide details about the alert"
            rows={4}
            {...register("description", {
              required: "Description is required",
              minLength: {
                value: 10,
                message: "Description should be at least 10 characters",
              },
            })}
          />
          {errors.description && (
            <p className="text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Location</Label>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <Input
              id="address"
              placeholder="Enter location address"
              {...register("address", { required: "Location is required" })}
            />
          </div>
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image (Optional)</Label>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-center border-2 border-dashed border-muted rounded-lg p-4">
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                {imagePreview ? (
                  <div className="relative w-full">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload an image
                    </span>
                  </>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting Alert...
            </>
          ) : (
            "Post Alert"
          )}
        </Button>
      </form>
    </Card>
  );
};

export default AlertForm;
