"use client";

import { Session } from "next-auth";
import Home from "./Home";
import InstagramFeed from "../common/InstagramFeed";

type Props = {
  session: Session | null;
};

export default function HomeClientPage({ session }: Props) {
  return <>{session ? <InstagramFeed /> : <Home />}</>;
}
