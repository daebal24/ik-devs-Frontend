# Next.js + TypeScript Sample

A minimal starter using **Next.js 14 (App Router)** with **TypeScript**. Includes:
- Basic pages (`/` and `/about`)
- A simple API route at `/api/health`
- Strict TypeScript config, ESLint, and Node 20 compatibility

## Requirements
- Node.js **20.13.1** (or newer within Node 20)
- npm v9+ (or pnpm/yarn if you prefer—update commands accordingly)

## Getting Started

```bash
# install deps
npm install

# run dev server at http://localhost:3000
npm run dev

# build for production
npm run build

# start production server
npm run start
```

## Project Structure
```
app/
  api/health/route.ts  # example API route
  about/page.tsx       # /about route
  layout.tsx           # shared root layout
  page.tsx             # home page
public/
  favicon.ico
next.config.mjs
tsconfig.json
.eslintrc.json
```

## Notes
- This template uses the **App Router** (no `pages/` directory).
- If you deploy to services like Vercel, this configuration works out-of-the-box.
- If you see TypeScript errors at first run, run `npm run dev` once so Next can emit types.
===============
* wiki style
      ㄴ http://localhost:5000/test/home/aaa 이렇게 요청하면 /home/page.tsx에서 aaa를 파라미터로 인지하고 aaa에 해당되는 DB 값 불러서 뿌리기
      ㄴ http://localhost:5000/test/home/aaa 에서 페이지 작업 후 저장하면 DB에서 내용과 현재페이지 주소 aaa를 백엔드로 보내서 aaa에 해당되는곳에 내용 저장
      ㄴ

===========
TODOlsit

box태그 관련 재정리
imageupload css 다듬기
createuser ?
image 업로드(태그지원)
ppt 또는 pdf 업로드하고 해당기능은 새창에서 띄우기 기능 추가

=======================================
* pages
login
  ㄴ 아이디,패스워드 입력 -> 기본적인 검사 -> 백엔드 송신 -> 백엔드 처리후 수신 -> 로그인 처리 
main - 다른 페이지로 이동하는 메뉴버튼 모음(header의 영역 이쪽이 담당)
introduction&skill
tasks(summary) : tasksummary
  - 한 페이지로 요약. deatil 먼저 만들고 나중에?
  - 왼쪽 오른쪽 단 나누고 박스 중첩까지 구현하려니 매우 복잡해짐. 차라리 위키방식이 아닌 별도페이지 제작 고려
  - 내용
    - 년별 요약
    - 주 업무
    - 프로젝트별
      - A(service), A(solution)
      - B(service)
      - C(solution)
  - db연동 : 
      pagecontent 테이블
      index Tag title content createat updateat

  tasks detail :  
    - 년-월 task
    - 각 글별 태그달기
    - 내용이 복잡해지거나 길어진다 싶으면 그냥 문서로 대체.

manageimage - 탐색기형태
  - 미리보기 이름
  - 이름, 날짜, 유형, 미리보기, 수정하기, 삭제하기
imageupload - 정리, dbsave 로직 만들기, 관리로직만들기
documentlist - 위키문서목록, 탐색기형태

createuser : 계정생성페이지?

* page - detail
문서수정창, 문서등록창, 문서삭제창(권한필요)
=======================================







=======================================
==디자인==
https://www.cssdesignawards.com/
  https://micheledu.com/

==기타 도입==
* 로그인?(소셜연동)
  ㄴ 관리자
  ㄴ 일반 사용자
* 보안취약점 패치
* 로깅
* 커스텀 결제api, 
* 메신저?
