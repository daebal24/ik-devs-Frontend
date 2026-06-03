"use client";

import { IsLoginApiData, IsLoginApiData_data } from "@/types/api";

export default async function isLogin() {
    let result: IsLoginApiData_data = {
        usertype: "",
        haveSession: false,
        userid: ""
    };
    try {
        const res = await fetch("/api/commonapi", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                apiname: "verifytoken",
            }),
        });

        if (!res.ok) {
            throw new Error(`status: ${res.status}`);
        }

        const apiresult: IsLoginApiData = await res.json();
        result = apiresult.data;
        return result;
    } catch (err) {
        console.error("에러:", err);
        return result;
    }
}
