
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertCircle, Clock, MapPin, User, Flame, ShieldAlert, Car, Cloud, HelpCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export type AlertCategory = "fire" | "crime" | "accident" | "weather" | "other";

export interface Alert {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: AlertCategory;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  createdAt: {
    toDate: () => Date;
  };
  createdBy: {
    uid: string;
    email: string;
  };
}

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

const getCategoryColor = (category: AlertCategory) => {
  switch (category) {
    case "fire":
      return "bg-alert-fire";
    case "crime":
      return "bg-alert-crime";
    case "accident":
      return "bg-alert-accident";
    case "weather":
      return "bg-alert-weather";
    default:
      return "bg-alert-other";
  }
};

const getCategoryIcon = (category: AlertCategory) => {
  switch (category) {
    case "fire":
      return <Flame className="h-4 w-4" />;
    case "crime":
      return <ShieldAlert className="h-4 w-4" />;
    case "accident":
      return <Car className="h-4 w-4" />;
    case "weather":
      return <Cloud className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

const AlertCard: React.FC<AlertCardProps> = ({ alert, onClick }) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-border/50 hover:border-primary/20"
      onClick={onClick}
    >
      {alert.imageUrl && (
        <div className="h-48 overflow-hidden">
          <img 
            src={alert.imageUrl} 
            alt={alert.title} 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-lg line-clamp-1">{alert.title}</h3>
          <span className={`alert-category-badge flex items-center gap-1 ${getCategoryColor(alert.category)}`}>
            {getCategoryIcon(alert.category)}
            {alert.category.charAt(0).toUpperCase() + alert.category.slice(1)}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {alert.description}
        </p>
        <div className="flex items-center text-xs bg-secondary/50 p-2 rounded-md">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{alert.location.address}</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 text-xs text-muted-foreground border-t border-border/50">
        <div className="flex justify-between w-full py-2">
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            <span>{alert.createdBy.email.split('@')[0]}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true })}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AlertCard;
