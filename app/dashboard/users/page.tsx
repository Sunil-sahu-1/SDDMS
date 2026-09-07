"use client";
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {Loading} from "@/components/Loading";
export default function UsersPage(){const router=useRouter();useEffect(()=>{try{const u=JSON.parse(localStorage.getItem("sddms_user")||"{}");if(u?.role==="ADMIN")router.replace("/dashboard/admin");else router.replace("/dashboard")}catch{router.replace("/dashboard")}},[router]);return <Loading label="Opening identity administration…"/>}
