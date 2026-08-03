"use client";

import { useEffect } from "react";

export function GlobalAlert() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    window.alert = (message: string) => {
      const isDark = document.documentElement.classList.contains("dark");
      
      const dialog = document.createElement("dialog");
      dialog.style.cssText = `
        border: 1px solid ${isDark ? "#334155" : "#eaddcd"};
        border-radius: 16px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        padding: 24px;
        background: ${isDark ? "#0f172a" : "#faf8f5"};
        max-width: 380px;
        width: calc(100% - 32px);
        color: ${isDark ? "#f8fafc" : "#1e293b"};
        font-family: var(--font-sans), system-ui, -apple-system, sans-serif;
        box-sizing: border-box;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
      `;

      dialog.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; border-bottom: 1px solid ${isDark ? "#334155" : "#f2eae1"}; padding-bottom: 10px;">
            <span style="font-weight: 850; font-size: 13px; color: #c05621; text-transform: uppercase; letter-spacing: 0.05em;">Ixigo says</span>
          </div>
          <div style="font-size: 14px; font-weight: 500; line-height: 1.5; color: ${isDark ? "#cbd5e1" : "#4a5568"}; word-break: break-word; padding-bottom: 4px;">
            ${message}
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
            <button id="alert-close-btn" style="
              background: #c05621;
              color: white;
              border: none;
              padding: 8px 20px;
              border-radius: 10px;
              font-size: 12px;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.2s;
            ">OK</button>
          </div>
        </div>
      `;

      // Backdrop styling helper
      const style = document.createElement("style");
      style.innerHTML = `
        dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
        }
        #alert-close-btn:hover {
          background-color: #a8481b;
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(dialog);
      dialog.showModal();

      const btn = dialog.querySelector("#alert-close-btn");
      btn?.addEventListener("click", () => {
        dialog.close();
        dialog.remove();
        style.remove();
      });
    };
  }, []);

  return null;
}
