# project-g: 그늘길 프로젝트

## 🌐 배포 주소

[https://project-g-seven.vercel.app/](https://project-g-seven.vercel.app/)

## 💡 앱 설명

`project-g`는 현재 시간을 기준으로 건물로 인해 발생하는 그림자를 지도에 시각적으로 표시해주는 웹 애플리케이션입니다. 모든 건물은 지면의 폴리곤 기반으로 특정 높이를 가진 기둥 형태로 가정하며, 모든 빛은 일정한 입사각으로 일정하고 평행하게 지면에 도달한다고 가정하여 그림자를 계산합니다.

그림자 계산은 `tan(태양 고도)`를 이용하여 그림자의 길이를 계산하고, 지면의 폴리곤을 그림자 길이만큼 늘려 그림자를 완성하는 방식으로 이루어집니다.

**⚠️ 주의사항:**

- 그림자 계산은 모든 건물이 지면의 폴리곤을 밑면으로 하는 기둥 형태라고 가정하여 러프하게 이루어지므로, 복잡한 구조의 건물의 경우 그림자 형태가 실제와 다를 수 있습니다.
- 사용된 건물 3D 데이터의 높이가 실제 건물과 많이 다를 수 있어, 그림자 길이가 부정확할 수 있습니다.

**✨ 최적의 사용 환경:**

- 이 앱은 높이에 따른 건물 모양이 일정한 기둥 형태의 고층 빌딩이 많이 밀집해 있는 지역에서 유용하게 활용될 수 있습니다.

## 🛠️ 사용 기술 스택

- **React**: 사용자 인터페이스 구축을 위한 JavaScript 라이브러리
- **Vite**: 빠르고 효율적인 프론트엔드 개발 도구
- **Tailwind CSS**: 유틸리티 우선(utility-first) CSS 프레임워크
- **Mapbox GL JS**: 인터랙티브한 웹 지도 및 3D 건물, 그림자 표시
- **suncalc**: 태양의 위치(고도, 방위각) 계산
- **@turf/turf**: 지리 공간 분석 라이브러리 (그림자 폴리곤 생성에 활용)
- **react-icons**: 아이콘 라이브러리

## 📂 프로젝트 구조

```
project-g/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── components/
│   │   └── map/
│   │       ├── MapContainer.jsx
│   │       ├── MapDebugInfo.jsx
│   │       ├── MoveCurrentLocationButton.jsx
│   │       └── ScaleController.jsx
│   └── pages/
│       └── map/
│           ├── index.js
│           └── MapPage.jsx
├── .gitignore
├── babel.config.js
├── eslint.config.js
├── GEMINI.md
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── vite.config.js
```

## 🚀 실행 방식

프로젝트를 로컬 환경에서 실행하려면 다음 단계를 따르세요:

1.  **의존성 설치**

    ```bash
    npm install
    ```

2.  **개발 서버 실행**

    ```bash
    npm run dev
    ```

    개발 서버가 시작되면 브라우저에서 `http://localhost:5173` (또는 콘솔에 표시되는 주소)로 접속하여 앱을 확인할 수 있습니다.
