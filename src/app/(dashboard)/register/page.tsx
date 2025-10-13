"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="flex items-center justify-center mx-auto my-12 min-h-screen">
      <div className="w-full max-w-[40rem] p-8 mx-auto backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold my-6 flex items-center justify-center">
          Register
        </h1>
        <form>
          <div className="my-8">
            <FieldSet>
              <FieldGroup>
                <div className="flex flex-row gap-2">
                  <Field>
                    <FieldLabel htmlFor="fname">First Name</FieldLabel>
                    <Input id="fname" type="text" placeholder="John Doe" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="lname">Last Name</FieldLabel>
                    <Input id="lname" type="text" placeholder="John Doe" />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phn">Phone Number</FieldLabel>
                  <Input id="phn" type="text" placeholder="9876543210" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldDescription>
                    Must be at least 8 characters long.
                  </FieldDescription>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showPass ? "text" : "password"}
                      placeholder="********"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? (
                        <EyeOff className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
            <RadioGroup defaultValue="citizen" className="my-8">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="citizen" id="citizen" />
                <Label htmlFor="citizen">Citizen</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="worker" id="worker" />
                <Label htmlFor="worker">Worker</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ngo" id="ngo" />
                <Label htmlFor="ngo">NGO</Label>
              </div>
            </RadioGroup>
          </div>
          <Button
            type="submit"
            className="w-full mt-4 py-2 px-6 flex bg-blue-500 hover:bg-blue-600"
          >
            Login
          </Button>
          <p className="text-sm text-center mt-4">
            Already have an account? <Link href="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
