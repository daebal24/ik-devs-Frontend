"use client";

import { IsLoginApiData, IsLoginApiData_data } from "@/types/api";

export default async function isLogin() 
{
    let result:IsLoginApiData_data={
        usertype: "",
        haveSession: false,
        userid: ""
    };
    try {
        const res = await fetch("/api/commonapi", {
            method: "POST",
            credentials: "include", // 중요 (세션 쿠키 포함)
            body: JSON.stringify({
                apiname: "getsession",
            }),
        });

        if (!res.ok) {
            throw new Error(`status: ${res.status}`);
        }

        let apiresult:IsLoginApiData = await res.json()
        //console.log("세션 응답:", apiresult);
        result = apiresult.data;
        //console.log("document.cookie:", document.cookie);
        return result;
        
    } 
    catch (err) 
    {
        console.error("에러:", err);
        return result;
    }    
}
