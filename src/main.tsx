import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { router } from "./router";
import { RouterProvider } from "react-router-dom";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { NuqsAdapter } from "nuqs/adapters/react-router/v6";
import { getSiteBasicInfo } from "./api/api.ts";
import { SiteBasicInfo } from "./api/site.ts";

interface ManifestData {
  short_name: string;
  name: string;
  icons: Array<{
    src: string;
    sizes: string;
    type: string;
  }>;
  start_url: string;
  display: string;
  theme_color: string;
  background_color: string;
}

// 初始化时获取网站基础信息并填充 HTML
async function initializeSiteBasicInfo() {
  try {
    const action = getSiteBasicInfo();
    const response = await store.dispatch(action as any);
    
    if (response && response.settings) {
      const settings = response.settings as SiteBasicInfo;
      
      // 构建网站基础信息对象
      const basicInfo: SiteBasicInfo = {
        site_name: settings.site_name,
        site_des: settings.site_des,
        site_script: settings.site_script,
        pwa_small_icon: settings.pwa_small_icon,
        pwa_medium_icon: settings.pwa_medium_icon,
        pwa_large_icon: settings.pwa_large_icon,
        theme_color: settings.theme_color,
        default_theme_color: settings.default_theme_color,
      };
      
      // 更新 HTML 中的占位符
      updateHtmlWithSiteInfo(basicInfo);
      
      // 更新 manifest.json
      // await updateManifestJson(basicInfo);
    }
  } catch (error) {
    console.error("Failed to initialize site basic info:", error);
  }
}

function updateHtmlWithSiteInfo(info: SiteBasicInfo) {
  // 更新 title
  if (info.site_name) {
    document.title = info.site_name;
  
    // 更新 window.subTitle
    (window as any).subTitle = info.site_name;
  }
  
  // 更新 meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (info.site_des && metaDescription) {
    metaDescription.setAttribute("content", info.site_des);
  }
  
  // 更新 theme-color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (info.theme_color && metaTheme) {
    metaTheme.setAttribute("content", info.theme_color);
  }
  
  // 更新 CSS 变量
  const root = document.documentElement;
  if (info.default_theme_color) {
    root.style.setProperty("--defaultThemeColor", info.default_theme_color);
  }
  
  // 更新 favicon
  const favicon = document.querySelector('link[rel="shortcut icon"]') as HTMLLinkElement;
  if (favicon && info.pwa_small_icon) {
    favicon.href = info.pwa_small_icon;
  }
  
  // 更新 logo 背景图片 (app-loader 中)
  const logoElement = document.querySelector("#app-loader .logo") as HTMLElement;
  if (logoElement && info.pwa_medium_icon) {
    logoElement.style.backgroundImage = `url("${info.pwa_medium_icon}")`;
  }
  
  // 如果有 site_script，添加到页面
  if (info.site_script) {
    const scriptContainer = document.querySelector("body");
    if (scriptContainer) {
      scriptContainer.innerHTML += info.site_script;
    }
  }
}

async function updateManifestJson(basicInfo: SiteBasicInfo) {
  try {
    // 构建 manifest 数据
    const manifestData: ManifestData = {
      short_name: basicInfo.site_name || "cloudDyst",
      name: basicInfo.site_name || "cloudDyst",
      icons: [
        {
          src: basicInfo.pwa_small_icon || "/logo.png",
          sizes: "64x64 32x32 24x24 16x16",
          type: "image/x-icon",
        },
        {
          src: basicInfo.pwa_medium_icon || "/logo.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: basicInfo.pwa_large_icon || "/logo.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      start_url: ".",
      display: "standalone",
      theme_color: basicInfo.theme_color || "#1976d2",
      background_color: "#ffffff",
    };

    // 尝试读取现有的 manifest.json
    let needsUpdate = true;
    try {
      const response = await fetch("/manifest.json");
      if (response.ok) {
        const existingManifest = await response.json();
        // 比较是否需要更新
        if (
          existingManifest.short_name === manifestData.short_name &&
          existingManifest.name === manifestData.name &&
          existingManifest.theme_color === manifestData.theme_color &&
          existingManifest.icons?.length === manifestData.icons.length &&
          existingManifest.icons?.every(
            (icon: any, index: number) =>
              icon.src === manifestData.icons[index].src
          )
        ) {
          needsUpdate = false;
        }
      }
    } catch (e) {
      // manifest.json 不存在或读取失败，需要更新
      console.debug("Could not read existing manifest.json, will create new one");
    }

    if (needsUpdate) {
      // 调用后端 API 更新 manifest.json
      try {
        const response = await fetch("/api/manifest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(manifestData),
        });
        if (!response.ok) {
          console.warn("Failed to update manifest.json on server");
        }
      } catch (e) {
        console.warn("Could not update manifest.json via API:", e);
        // 如果 API 不存在，尝试直接更新本地 manifest（仅在开发环境）
        if (import.meta.env.DEV) {
          await updateLocalManifest(manifestData);
        }
      }
    }
  } catch (error) {
    console.error("Error updating manifest:", error);
  }
}

async function updateLocalManifest(manifestData: ManifestData) {
  try {
    // 这仅在开发环境有效，通过 Vite 的特殊处理
    const response = await fetch("/__update_manifest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(manifestData),
    });
    if (response.ok) {
      console.log("Local manifest updated successfully");
    }
  } catch (e) {
    console.debug("Local manifest update not supported in this environment");
  }
}

// 在渲染应用之前初始化网站信息
initializeSiteBasicInfo().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
      <NuqsAdapter>
        <RouterProvider router={router}></RouterProvider>
      </NuqsAdapter>
    </Provider>,
  );
});
