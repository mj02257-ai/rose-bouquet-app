# 배포 가이드

## 로컬 개발

```bash
# 기본 (PC 로컬 전용)
npm run dev
# → http://localhost:3000

# 모바일 로컬 테스트 (같은 Wi-Fi 전용)
npm run dev:host
# → http://[PC의 IPv4]:4000
# PC IPv4 확인: ipconfig (Windows) / ifconfig (Mac/Linux)
# ⚠️ 같은 Wi-Fi에 있어야 함. LTE/외부 네트워크에서는 접속 불가
```

---

## 외부 사용자 공개 배포 — Vercel

외부 사용자 (LTE, 다른 Wi-Fi 등)가 접속하려면 Vercel 배포가 필요합니다.

### 1단계 — GLB 파일 준비 (⚠️ 배포 전 필수)

**현재 상태 진단:**

| 파일 | 상태 |
|------|------|
| `public/assets/3d/roses/rose-red.glb` | ✅ 실제 바이너리 (22MB) — 배포 즉시 가능 |
| `public/assets/3d/roses/rose-pink.glb` | ✅ 실제 바이너리 (22MB) — 배포 즉시 가능 |
| `public/assets/3d/roses/rose-white.glb` | ✅ 실제 바이너리 (23MB) — 배포 즉시 가능 |
| `public/assets/3d/roses/rose-peach.glb` | ✅ 실제 바이너리 (23MB) — 배포 즉시 가능 |
| `public/assets/3d/wrappers/wrapper_ribbon_tied_base.glb` | ❌ Git LFS 포인터 (133B) — **교체 필요** |
| `public/assets/3d/wrappers/wrapper_wrapped_base.glb` | ❌ Git LFS 포인터 (133B) — **교체 필요** |

**wrapper GLB 교체 방법:**

```bash
# 1. 원본 wrapper GLB 파일을 복사해서 아래 경로에 덮어쓰기
#    (실제 45MB 바이너리 파일이어야 함)
#    원본 파일이 있는 폴더에서:

cp /path/to/actual/wrapper_ribbon_tied_base.glb \
   public/assets/3d/wrappers/wrapper_ribbon_tied_base.glb

cp /path/to/actual/wrapper_wrapped_base.glb \
   public/assets/3d/wrappers/wrapper_wrapped_base.glb

# 2. 파일 크기 확인 (반드시 수 MB 이상이어야 함)
ls -lh public/assets/3d/wrappers/

# 3. git에 실제 바이너리로 커밋
git rm --cached public/assets/3d/wrappers/wrapper_ribbon_tied_base.glb
git rm --cached public/assets/3d/wrappers/wrapper_wrapped_base.glb
git add public/assets/3d/wrappers/wrapper_ribbon_tied_base.glb
git add public/assets/3d/wrappers/wrapper_wrapped_base.glb
git commit -m "Add actual wrapper GLB binaries (replace LFS pointers)"
git push origin main
```

> **왜 이 문제가 발생했나?**
> Wrapper GLB가 로컬 Git LFS 서버에만 저장되어 있고 GitHub LFS 스토리지에는
> 업로드된 적이 없습니다. Vercel은 GitHub에서 파일을 가져오므로 실제 바이너리가
> 없으면 3D 포장지가 로드되지 않습니다.

---

### 2단계 — Vercel 프로젝트 연결

1. [https://vercel.com](https://vercel.com) → "Add New Project"
2. GitHub 저장소 `mj02257-ai/rose-bouquet-app` import
3. 아래 설정 확인 (자동 감지되지 않으면 수동 입력):

| 항목 | 값 |
|------|-----|
| Framework Preset | **Next.js** |
| Install Command | `npm install --legacy-peer-deps` |
| Build Command | `npm run build` |
| Output Directory | `.next` (기본값) |
| Root Directory | `/` (기본값) |

4. **환경변수**: 없음 (필요 없음)

5. **Git LFS**: 비활성화 (GitHub LFS에 실제 파일이 없으므로 오히려 방해됨)

6. "Deploy" 클릭

---

### 3단계 — 배포 확인

배포 완료 후 `https://[project-name].vercel.app` 에서 확인:

- [ ] PC에서 접속 가능
- [ ] 모바일 LTE/5G에서 접속 가능
- [ ] 아이보리 배경 (`#F4F2EE`)
- [ ] Red / Pink / White / Peach 클릭 시 3D 장미 교체
- [ ] 3D 포장지(블랙 리본) 정상 로딩
- [ ] 꽃다발 완성하기 → 아이보리 ShowcaseView (검정 배경 없음)
- [ ] 선물하기 모달 → 아이보리 (구버전 작은 꽃 아이콘 없음)
- [ ] `/share?data=...` 공유 링크 → 3D 꽃다발 + 아이보리 배경
- [ ] 구버전 "여기에 두기 / 고정하기" UI 없음

---

## Git LFS 관련 주의사항

- `.gitattributes`에서 `*.glb filter=lfs` 트래킹이 **제거**되었습니다.
- 앞으로 GLB 파일을 추가할 때는 일반 `git add`를 사용하세요.
- 파일 크기 제한: GitHub 단일 파일 100MB 이하. 현재 GLB(22-45MB)는 모두 해당.
- Rose GLBs (22-23MB)는 이미 GitHub에 실제 바이너리로 저장되어 있어 Vercel 정상 작동.

---

## 파일 구조

```
public/
  assets/
    3d/
      roses/
        rose-red.glb      ← 22MB 실제 바이너리 ✅
        rose-pink.glb     ← 22MB 실제 바이너리 ✅
        rose-white.glb    ← 23MB 실제 바이너리 ✅
        rose-peach.glb    ← 23MB 실제 바이너리 ✅
      wrappers/
        wrapper_ribbon_tied_base.glb  ← 교체 필요 ⚠️
        wrapper_wrapped_base.glb      ← 교체 필요 ⚠️
```
