
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { Alert } from "@/components/AlertCard";
import AlertCard from "@/components/AlertCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, User, Plus, Trash2 } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userAlerts, setUserAlerts] = useState<Alert[]>([]);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserAlerts();
    }
  }, [user]);

  const fetchUserAlerts = async () => {
    try {
      setLoading(true);
      const alertsCollection = collection(db, "alerts");
      const userAlertsQuery = query(
        alertsCollection,
        where("createdBy.uid", "==", user?.uid)
      );
      
      const querySnapshot = await getDocs(userAlertsQuery);
      const alertsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Alert[];
      
      setUserAlerts(alertsList);
    } catch (error: any) {
      toast({
        title: "Error fetching your alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async () => {
    if (!alertToDelete) return;
    
    try {
      setLoading(true);
      
      // First, get the alert to check if it has an image
      const alertRef = doc(db, "alerts", alertToDelete);
      const alertToDeleteData = userAlerts.find(a => a.id === alertToDelete);
      
      // Delete the image from storage if it exists
      if (alertToDeleteData?.imageUrl) {
        try {
          const imageRef = ref(storage, alertToDeleteData.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error("Error deleting image:", error);
          // Continue with alert deletion even if image deletion fails
        }
      }
      
      // Delete the alert document
      await deleteDoc(alertRef);
      
      // Update the UI
      setUserAlerts((prev) => prev.filter((alert) => alert.id !== alertToDelete));
      
      toast({
        title: "Alert deleted",
        description: "Your alert has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting alert",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAlertToDelete(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-primary/10 p-4 rounded-full">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">{user?.email}</p>
            <p className="text-sm text-muted-foreground">Member since {user?.metadata.creationTime?.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Alerts</h2>
          <Button 
            onClick={() => navigate("/create-alert")}
            className="flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            Post New Alert
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : userAlerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userAlerts.map((alert) => (
              <div key={alert.id} className="relative group">
                <AlertCard alert={alert} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setAlertToDelete(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your alert. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAlert}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="mb-4 text-muted-foreground">You haven't posted any alerts yet</p>
            <Button 
              onClick={() => navigate("/create-alert")}
              className="flex items-center"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post Your First Alert
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
