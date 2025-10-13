import { usePathname } from "next/navigation";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";
import {
  AlarmClock,
  Building,
  Calendar,
  Files,
  FileText,
  FolderUp,
  Heart,
  Home,
  Menu,
  Settings,
  Stethoscope,
  X,
  Pill,
} from "lucide-react";
import { NAVBAR_HEIGHT } from "@/components/Layouts/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BsChatFill } from "react-icons/bs";

const AppSidebar = ({ userType }: AppSidebarProps) => {
  const pathname = usePathname();
  const { toggleSidebar, open } = useSidebar();

  const navLinks =
    userType === "citizen"
      ? [
          { icon: Building, label: "Overview", href: "/doctor/overview" },
          {
            icon: FileText,
            label: "Appointments",
            href: "/doctor/appointments",
          },
          {
            icon: Pill,
            label: "Prescriptions",
            href: "/doctor/prescriptions",
          },
          {
            icon: FolderUp,
            label: "Upload Files",
            href: "/doctor/upload-files",
          },

          { icon: Files, label: "Files", href: "/doctor/files" },

          { icon: Settings, label: "Settings", href: "/doctor/settings" },
        ]
      : userType === "ngo"
      ? [
          { icon: Heart, label: "Overview", href: "/hospital/overview" },
          {
            icon: FileText,
            label: "Doctors",
            href: "/hospital/doctors",
          },
          { icon: Home, label: "Appointments", href: "/hospital/appointments" },

          { icon: Settings, label: "Settings", href: "/hospital/settings" },
        ]
      : [
          { icon: Home, label: "Overview", href: "/user/overview" },
          {
            icon: AlarmClock,
            label: "My appointments",
            href: "/user/my-appointments",
          },
          {
            icon: Calendar,
            label: "Book Appointments",
            href: "/user/appointments",
          },
          {
            icon: Pill,
            label: "Prescriptions",
            href: "/user/prescriptions",
          },
          {
            icon: BsChatFill,
            label: "Chat with AI",
            href: "/user/chat",
          },
          {
            icon: FolderUp,
            label: "Upload Files",
            href: "/user/upload-files",
          },
          {
            icon: FileText,
            label: "Files",
            href: "/user/files",
          },
          {
            icon: Stethoscope,
            label: "Symptom Checker",
            href: "/user/symptom-checker",
          },
          { icon: Settings, label: "Settings", href: "/user/settings" },
        ];

  return (
    <Sidebar
      collapsible="icon"
      className="fixed left-0 bg-zinc-100 dark:bg-zinc-900  shadow-lg"
      style={{
        top: `${NAVBAR_HEIGHT}px`,
        height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
      }}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex w-full items-center pt-3 mb-3",
                open ? "justify-between px-6" : "justify-center"
              )}
            >
              {open ? (
                <>
                  <h1 className="text-xl font-bold">
                    {userType === "citizen"
                      ? "Citizen View"
                      : userType === "ngo"
                      ? "NGO View"
                      : "User View"}
                  </h1>
                  <button
                    className="hover:bg-zinc-200 hover:bg-opacity-60 p-2 rounded-md"
                    onClick={() => toggleSidebar()}
                  >
                    <X className="h-6 w-6" />
                  </button>
                </>
              ) : (
                <button
                  className="hover:bg-zinc-200 hover:bg-opacity-60 p-2 rounded-md"
                  onClick={() => toggleSidebar()}
                >
                  <Menu className="h-6 w-6 " />
                </button>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    "flex items-center px-7 py-7",
                    isActive ? "bg-zinc-200" : " hover:bg-zinc-200",
                    open ? "text-blue-600" : "ml-[5px]"
                  )}
                >
                  <Link href={link.href} className="w-full" scroll={false}>
                    <div className="flex items-center gap-3">
                      <link.icon
                        className={`h-5 w-5 ${
                          isActive ? "text-blue-600" : "text-black"
                        }`}
                      />
                      <span
                        className={`font-medium ${
                          isActive ? "text-blue-600" : "text-black"
                        }`}
                      >
                        {link.label}
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
