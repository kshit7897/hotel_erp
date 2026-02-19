import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createStaffSchema, type CreateStaffRequest, UserRole } from "@shared/schema";
import { Loader2, UserPlus, ShieldCheck } from "lucide-react";

// For client-side user creation without logging out current user
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function StaffManagement() {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateStaffRequest>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff"
    }
  });

  const onSubmit = async (data: CreateStaffRequest) => {
    setIsPending(true);
    let secondaryApp;

    try {
      // 1. Create a secondary Firebase App instance so we don't log out the admin
      // using the config from existing environment
      const firebaseConfig = {
        apiKey: "AIzaSyAv0w9mgKlQueq5kBCtOnGseXzbEorGKuE",
        authDomain: "hotel-erp-a8e38.firebaseapp.com",
        projectId: "hotel-erp-a8e38",
        storageBucket: "hotel-erp-a8e38.firebasestorage.app",
        messagingSenderId: "344378058320",
        appId: "1:344378058320:web:2a3dec0e91cac5883d9355",
      };

      secondaryApp = initializeApp(firebaseConfig, "Secondary");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Create the user
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // 3. Update Profile (DisplayName)
      await updateProfile(user, {
        displayName: data.name
      });

      // 4. Create User Document in Firestore with Role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: data.name,
        role: data.role || "staff",
        createdAt: serverTimestamp()
      });

      // 5. Success
      toast({
        title: "Staff Created",
        description: `Account created for ${data.name} as ${data.role}`,
      });

      form.reset();

      // Logout the secondary user immediately just in case
      await signOut(secondaryAuth);

    } catch (error: any) {
      console.error("Error creating staff:", error);
      toast({
        title: "Creation Failed",
        description: error.message || "Could not create user account",
        variant: "destructive",
      });
    } finally {
      // 6. Cleanup
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Staff Management</h1>
        <p className="text-muted-foreground">Create new access accounts for kitchen staff</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Register New Staff</CardTitle>
              <CardDescription>Creates a new user access account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="staff@restaurant.com" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.register("role")}
              >
                <option value="staff">Staff (Kitchen Only)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Staff Account"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-4 text-sm text-blue-700 dark:text-blue-300">
        <ShieldCheck className="h-5 w-5 flex-shrink-0" />
        <p>
          New accounts are immediately active. Roles are checked upon login.
        </p>
      </div>
    </div>
  );
}
