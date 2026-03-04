// types/api.ts
export type ApiData = {
    message: string;
    now: string;
  };

export type viewPageData = {
  id: number;
  content: string;
  pagename: string;
  memo: string;
};
  
export type ViewMediaData={
  name:string;
  memo:string;
  filename:string;
  filetype:string;
}

export type IsLoginApiData = {
  ok: boolean;
  message: string;
  data: {
    usertype: string;
    haveSession: boolean;
    userid: string;
  };
};

export type IsLoginApiData_data = {
  usertype: string;
  haveSession: boolean;
  userid: string;
};