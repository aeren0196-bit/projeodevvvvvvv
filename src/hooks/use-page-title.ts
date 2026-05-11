import { useEffect } from "react";
import constants from "@/constants/constants.json";
interface UsePageTitleOptions {
  title?: string;
  description?: string;
  appendSiteName?: boolean;
}

export const usePageTitle = (options: UsePageTitleOptions = {}) => {
  useEffect(() => {
    if (!constants) return;

    const { title, description, appendSiteName = true } = options;

    // Set page title
    let pageTitle = title || constants.site.name;
    if (title && appendSiteName) {
      pageTitle = `${title} | ${constants.site.name}`;
    }
    document.title = pageTitle;

    // Set meta description
    const metaDescription = description || constants.site.description;
    let descriptionElement = document.querySelector('meta[name="description"]');

    if (!descriptionElement) {
      descriptionElement = document.createElement("meta");
      descriptionElement.setAttribute("name", "description");
      document.head.appendChild(descriptionElement);
    }

    descriptionElement.setAttribute("content", metaDescription);

    // Set favicon and apple-touch-icon if provided
    if (constants.site.favicon) {
      const faviconElement = document.querySelector(
        "#favicon",
      ) as HTMLLinkElement;
      if (faviconElement) {
        faviconElement.href = constants.site.favicon;
      }
      const appleTouchIcon = document.querySelector(
        "#apple-touch-icon",
      ) as HTMLLinkElement;
      if (appleTouchIcon) {
        appleTouchIcon.href = constants.site.favicon;
      }
    }
  }, [options]);

  return {
    siteName: constants?.site?.name || "",
    siteDescription: constants?.site?.description || "",
  };
};
