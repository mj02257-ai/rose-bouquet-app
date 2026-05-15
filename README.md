# 성년의 날, 장미꽃 선물

성년의 날에 맞춘 3D 장미 꽃다발 선물 웹앱.

## 기능

- Red / Pink / White / Peach 장미 1송이 선택
- 3D 꽃다발 (블랙 리본 포장지 + 장미) 실시간 렌더링
- 꽃다발 완성 → 자동 회전 3D 쇼케이스
- 메시지 카드 작성
- 공유 링크 생성 → 수신자도 3D 꽃다발 확인 가능

## 기술 스택

- **Next.js 14** (App Router)
- **@react-three/fiber** + **@react-three/drei** (Three.js)
- **Tailwind CSS**
- **TypeScript**

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## 모바일 로컬 테스트 (같은 Wi-Fi 전용)

```bash
npm run dev:host
# http://[PC IPv4]:4000  — 같은 Wi-Fi에서만 접속 가능
# LTE/외부 네트워크 → Vercel 배포 링크 사용
```

## 외부 공개 배포

Vercel 배포 방법 및 **GLB 파일 주의사항** → [DEPLOY.md](./DEPLOY.md) 참조

> ⚠️ `wrapper_ribbon_tied_base.glb`는 Git LFS 포인터로만 남아 있어
> **Vercel 배포 전 실제 바이너리로 교체가 필요**합니다. 자세한 내용은 DEPLOY.md 참조.

## 빌드

```bash
npm run build
```
