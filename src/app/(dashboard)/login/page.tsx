"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center mx-auto my-12 min-h-screen">
      <div className="w-full max-w-[40rem] p-8 mx-auto backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800">
        <h1 className="text-4xl font-bold my-6 flex items-center justify-center">
          Login
        </h1>
        <form>
          <div className="mb-4">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="username">Email</FieldLabel>
                  <Input id="username" type="text" placeholder="Max Leiter" />
                  <FieldDescription></FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <FieldDescription></FieldDescription>
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
              </FieldGroup>
            </FieldSet>
          </div>
          <Button
            type="submit"
            className="w-full mt-4 py-2 px-6 flex  bg-blue-500 hover:bg-blue-600"
          >
            Login
          </Button>
          <p className="text-sm text-center mt-4">
            Don&apos;t have an account? <Link href="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
