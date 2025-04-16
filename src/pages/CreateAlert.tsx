
import React from "react";
import AlertForm from "@/components/AlertForm";

const CreateAlert = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Create New Alert</h1>
        <p className="text-muted-foreground">
          Fill in the details below to create a new alert that will be visible to the community.
        </p>
      </div>
      
      <AlertForm />
    </div>
  );
};

export default CreateAlert;
