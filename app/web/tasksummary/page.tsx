// app/layout-sample/page.tsx
"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import isLogin from "@/app/lib/login/islogin";
import CustomMarkdown from "@/app/lib/customMarkdown/CustomMarkdown";
import styles from "./page.module.css";
import { ViewMediaData, IsLoginApiData_data } from "@/types/api";

type YearGroup = {
  id: number;
  title: string; // 사용자가 직접 입력하는 제목(예: "2022", "2023")
  content: string;   // 항목은 무조건 1개(단일 텍스트)
  open?: boolean;
  status: string; // "insert" | "update" | "delete" | ""
  isEditing?: boolean;
};

type Project = {
  id: number;
  title: string;
  content: string;
  status: string; // "insert" | "update" | "delete" | ""
  isEditing?: boolean;
};

type ViewPageContenttasksummary = {
  id:number;
  contenttype: string;
  title: string;
  content: string;
};

const initialYearGroups: YearGroup[] = [];
const initialProjects: Project[] = [];

export default function Page() {
  const router = useRouter();
  const [yearGroups, setYearGroups] = useState<YearGroup[]>(initialYearGroups);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [imageraw, setimagelist] = useState<ViewMediaData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const didRun = useRef(false);

  useEffect(() => {
    //현재 브라우저가 로그인된 상태인지 확인. 없으면 로그인 제한
    
    //StrictMode로 effect가 두 번 타도 첫 번째만 처리하게 막기
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      const isLoginResult:IsLoginApiData_data = await isLogin();
      if(isLoginResult.haveSession == false)
      {
        alert("접근 권한이 없습니다.");
        router.push("/web/login");
        return;
      }
      fetchImage();
      fetchData();
    })();
    

    //데이터 불러오기
    async function fetchData() {
      try {
        setError(null);
        const res = await fetch("/api/commonapi", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({
            apiname: "ViewPageContenttasksummary",
          }),
        });

        if (!res.ok) {
          throw new Error(`Request failed: ${res.status}`);
        }

        let json = await res.json();
        console.log(json.data);
        json.data = base64decoding_contents(json.data);
        console.log(json.data);
        // const content_encoded = Buffer.from(content, "utf8").toString("base64");
        // const decoded = Buffer.from(apiresult, "base64").toString("utf8");
        // console.log(decoded);
        datasplit(json.data);
      } catch (e) {
        setError((e as Error).message);
      }
    }

    async function fetchImage() {
      try {
        const res = await fetch("/api/commonapi", {
          method: "POST",
          cache: "no-store",
          body: JSON.stringify({ apiname: "viewMediaData" }),
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const json = await res.json();
        setimagelist(json.data as ViewMediaData[]);
      } catch (e) {
        setError((e as Error).message);
      }
    }

  }, []);

  const datasplit = (data: Array<ViewPageContenttasksummary>) => {
    data.forEach((item) => {
      switch (item.contenttype) {
        case "year":
          setYearGroup_fromDB(item);
          break;
        case "project":
          setaddProject_fromDB(item);
          break;
      }
    });
  };

  const base64encoding_yearcontents = (input:Array<YearGroup>) =>
  {
    return input.map(item => ({
      ...item,
      title: Buffer.from(item.title, 'utf8').toString('base64'),
      content: Buffer.from(item.content, 'utf8').toString('base64'),
    }));
  };
  const base64encoding_projectcontents = (input:Array<Project>) =>
  {
    return input.map(item => ({
      ...item,
      title: Buffer.from(item.title, 'utf8').toString('base64'),
      content: Buffer.from(item.content, 'utf8').toString('base64'),
    }));
  };

  const base64decoding_contents = (input:Array<ViewPageContenttasksummary>) =>
  {
    return input.map(item => ({
      ...item,
      title: Buffer.from(item.title, 'base64').toString('utf8'),
      content: Buffer.from(item.content, 'base64').toString('utf8'),
    }));
  };


  // 연도(제목) 추가 입력
  const [newYearTitle, setNewYearTitle] = useState<string>("");

  // 프로젝트 추가 입력
  const [newProjTitle, setNewProjTitle] = useState<string>("");
  const [newProjContent, setNewProjContent] = useState<string>("");

  const yearRangeText = useMemo(() => {
    const nums = yearGroups
      .filter((g) => g.status !== "delete")
      .map((g) => Number(g.title))
      .filter((n) => Number.isFinite(n));
    if (nums.length === 0) return "-";
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return `${min}–${max}`;
  }, [yearGroups]);

  const visibleYearGroups = useMemo(
    () => yearGroups.filter((g) => g.status !== "delete"),
    [yearGroups]
  );

  const visibleProjects = useMemo(
    () => projects.filter((p) => p.status !== "delete"),
    [projects]
  );

  // ===== 연도별 CRUD =====

  // DB 값 세팅
  const setYearGroup_fromDB = (item: ViewPageContenttasksummary) => {
    setYearGroups((prev) => [
      {
        id: item.id,
        title: item.title,
        content: item.content,
        open: true,
        status: "",
        isEditing: false,
      },
      ...prev,
    ]);
    setNewYearTitle("");
  };

  const addYearGroup = () => {
    const title = newYearTitle.trim();
    if (!title) return;

    // 중복 제목 방지
    if (yearGroups.some((g) => g.title === title)) return;

    setYearGroups((prev) => [
      {
        id: 0,
        title: title,
        content: "",
        open: true,
        status: "insert",
        isEditing: true,
      },
      ...prev,
    ]);

    setNewYearTitle("");
  };

  const updateYearTitle = (id: number, yearTitle: string) => {
    
    const next = yearTitle;
    setYearGroups((prev) => {
      // 다른 그룹과 제목 중복 방지
      if (prev.some((g) => g.id !== id && g.title === next.trim() && next.trim() !== "")) {
        return prev;
      }
      return prev.map((g) => 
      {
        if (g.id !== id) return g;
        const shouldMarkUpdate = g.status !== "insert" && g.status !== "delete";
        return {
          ...g,
          title:yearTitle,
          status: shouldMarkUpdate ? "update" : g.status,
        };
      });
    });
  };

  const updateYearContent = (id: number, content: string) => {
    setYearGroups((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const shouldMarkUpdate = g.status !== "insert" && g.status !== "delete";
        return {
          ...g,
          content,
          status: shouldMarkUpdate ? "update" : g.status,
        };
      })
    );
  };

  const deleteYearGroup = (id: number) => {
    if (confirm("정말 진행하시겠습니까?"))
    {setYearGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "delete", isEditing: false } : g))
    );}
  };

  const toggleEditYearGroup = (id: number) => {
    setYearGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isEditing: !g.isEditing } : g))
    );
  };

  // ===== 프로젝트 CRUD =====

  // DB 값 세팅
  const setaddProject_fromDB = (item: ViewPageContenttasksummary) => {
    const title = item.title;
    if (!title) return;

    setProjects((prev) => [
      { id: item.id, title, content: item.content, status: "", isEditing: false },
      ...prev,
    ]);
  };

  const addProject = () => {
    const title = newProjTitle.trim();
    if (!title) return;

    setProjects((prev) => [
      {
        id: 0,
        title,
        content: newProjContent,
        status: "insert",
        isEditing: true,
      },
      ...prev,
    ]);

    setNewProjTitle("");
    setNewProjContent("");
  };

  const updateProject = (id: number, patch: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const shouldMarkUpdate = p.status !== "insert" && p.status !== "delete";
        return {
          ...p,
          ...patch,
          status: shouldMarkUpdate ? "update" : p.status,
        };
      })
    );
  };

  const deleteProject = (id: number) => {
    if (confirm("정말 진행하시겠습니까?"))
    {setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "delete", isEditing: false } : p))
    );}
  };

  const toggleEditProject = (id: number) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, isEditing: !p.isEditing } : p)));
  };

  // ===== 데이터 저장 =====
  const onSave = async () => {
    try {
      console.log(base64encoding_yearcontents(yearGroups));
      console.log(base64encoding_projectcontents(projects));
      //return;
      
      
      //base64decoding_contents
      const res = await fetch("/api/commonapi", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiname: "UpdatePageContenttasksummary",
          bodydata: { "yearGroups": base64encoding_yearcontents(yearGroups), "projects": base64encoding_projectcontents(projects) },
        }),
      });

      if (!res.ok) {
        alert(`저장 실패 (${res.status})`);
        //location.reload();
        return;
      }

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        // ignore
      }

      if (json && json.success === false) {
        alert(`저장 실패${json.message ? `: ${json.message}` : ""}`);
        location.reload();
        return;
      }

      alert("저장 성공");
      location.reload();
    } catch (e) {
      alert(`저장 실패: ${(e as Error).message}`);
      location.reload();
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.title}>
          <h1>프로젝트</h1>
          <p>좌측: 연도별 / 우측: 수행 프로젝트</p>
          <p>추가 또는 수정 후 우측 상단 저장버튼을 눌러야 저장됩니다.</p>
        </div>
        <button className={styles.savebutton} onClick={onSave}>
          저장
        </button>
      </header>

      <main className={styles.layout}>
        {/* LEFT: 연도별 */}
        <section className={styles.card}>
          <div className={styles.hd}>
            <div className={styles.h}>연도별</div>
            <div className={styles.badge}>{yearRangeText}</div>
          </div>

          <div className={`${styles.bd} ${styles.years}`}>
            {visibleYearGroups.map((g) => (
              <details key={g.id} className={styles.year} open={g.open}>
                <summary className={styles.summary}>
                  <div className={styles.yearTitle}>
                    <span className={styles.dot} />
                    <span className={styles.yearLabel}>
                      <input
                        className={styles.yearInput}
                        value={g.title}
                        onChange={(e) => updateYearTitle(g.id, e.target.value)}
                        placeholder="예: 2022"
                        disabled={!g.isEditing}
                      />
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.btnGhost}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleEditYearGroup(g.id);
                      }}
                    >
                      {g.isEditing ? "완료" : "수정"}
                    </button>
                    <button
                      type="button"
                      className={styles.btnDangerGhost}
                      onClick={(e) => {
                        e.preventDefault();
                        deleteYearGroup(g.id);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </summary>

                <div className={styles.yearItems}>
                  {g.isEditing ? (
                    <textarea
                      className={styles.textarea}
                      value={g.content}
                      onChange={(e) => updateYearContent(g.id, e.target.value)}
                      placeholder="내용(단일 항목)"
                    />
                  ) : (
                    <div className={styles.textareaView}>
                      <CustomMarkdown source={g.content || ""} imageMap={imageraw} />
                    </div>
                  )}
                </div>
              </details>
            ))}


            {/* 하단: 연도(제목) 추가 */}
            <div className={styles.bottomAdd}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>연도(제목) 추가</div>
                <div className={styles.formRow}>
                  <input
                    className={styles.input}
                    value={newYearTitle}
                    onChange={(e) => setNewYearTitle(e.target.value)}
                    placeholder="예: 2022, 2023"
                  />
                  <button className={styles.btn} onClick={addYearGroup}>
                    추가
                  </button>
                </div>
                <div className={styles.help}>연도는 숫자여도 되고, “2022년”처럼 문자열도 가능합니다.</div>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: 수행 프로젝트 */}
        <section className={styles.card}>
          <div className={styles.hd}>
            <div className={styles.h}>수행 프로젝트</div>
            <div className={styles.badge}>{visibleProjects.length}</div>
          </div>

          <div className={styles.bd}>
            <div className={styles.list}>
              {visibleProjects.map((p, i) => (
                <article key={p.id} className={styles.item}>
                  <div className={styles.idx}>{i + 1}</div>

                  <div className={styles.meta}>
                    <input
                      className={styles.projectTitleInput}
                      value={p.title}
                      onChange={(e) => updateProject(p.id, { title: e.target.value })}
                      placeholder="제목"
                      disabled={!p.isEditing}
                    />
                    <br/>
                    {p.isEditing ? (
                      <textarea
                        className={styles.textarea}
                        value={p.content}
                        onChange={(e) => updateProject(p.id, { content: e.target.value })}
                        placeholder="내용"
                      />
                    ) : (
                      <div className={styles.textareaView}>
                        <CustomMarkdown source={p.content || ""} imageMap={imageraw} />
                      </div>
                    )}
                  </div>

                  <div className={styles.right}>
                    <button type="button" className={styles.btnGhost} onClick={() => toggleEditProject(p.id)}>
                      {p.isEditing ? "완료" : "수정"}
                    </button>
                    <button type="button" className={styles.btnDanger} onClick={() => deleteProject(p.id)}>
                      삭제
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* 하단: 프로젝트 추가 */}
            <div className={styles.bottomAdd}>
              <div className={styles.panel}>
                <div className={styles.panelTitle}>프로젝트 추가</div>
                <div className={styles.formRow}>
                  <input
                    className={styles.projectNewInput}
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    placeholder="제목"
                  />
                  <button className={styles.btn} onClick={addProject}>
                    추가
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 필요 시 error 표시 */}
        {error ? <div style={{ padding: 12, color: "#fca5a5" }}>{error}</div> : null}
      </main>
    </div>
  );
}
