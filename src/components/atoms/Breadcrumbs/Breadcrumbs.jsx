"use client";
import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import styles from "./styles.module.css";

const Breadcrumbs = ({
    items = [],
    useDynamicPath = false,
    pathLabels = {},
    maxItems = null,
    excludeSegments = [],
    slugLabels = {},
    disabledRoutes = [],
}) => {
    const pathname = decodeURIComponent(usePathname());

    // Generate dynamic breadcrumbs from pathname
    const generateDynamicBreadcrumbs = () => {
        if (!pathname || pathname === "/") {
            return [];
        }

        const pathSegments = pathname.split("/").filter(Boolean);

        // Filter out excluded segments (like hr-manager, hr-officer)
        const filteredSegments = pathSegments.filter(
            (segment) => !excludeSegments.includes(segment)
        );

        const breadcrumbs = [];
        let currentPath = "";

        // Rebuild the path considering excluded segments
        let originalIndex = 0;
        filteredSegments.forEach((segment, index) => {
            // Find the position of this segment in the original path
            while (
                originalIndex < pathSegments.length &&
                pathSegments[originalIndex] !== segment
            ) {
                originalIndex++;
            }

            // Build the current path including excluded segments for proper navigation
            const fullPath = pathSegments.slice(0, originalIndex + 1).join("/");
            currentPath = `/${fullPath}`;

            // Check if this segment comes after a parent that has slug labels
            const parentSegment = index > 0 ? filteredSegments[index - 1] : null;
            const isSlugAfterParent = parentSegment && slugLabels[parentSegment];

            // Convert segment to readable label
            let label;
            if (isSlugAfterParent) {
                // Use slug label for segments that come after specified parents
                label = slugLabels[parentSegment];
            } else {
                label =
                    pathLabels[segment] ||
                    pathLabels[currentPath] ||
                    segment
                        .replace(/-/g, " ")
                        .replace(/_/g, " ")
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
            }

            // All segments get breadcrumbs, including single segments
            // Last segment should not have href (current page)
            const isLast = index === filteredSegments.length - 1;
            breadcrumbs.push({
                label,
                href: isLast ? null : currentPath,
                segment,
                isCurrentPage: isLast,
            });

            originalIndex++;
        });

        return breadcrumbs;
    };

    // Use dynamic breadcrumbs if enabled, otherwise use provided items
    const breadcrumbItems = useDynamicPath ? generateDynamicBreadcrumbs() : items;

    if (!breadcrumbItems || breadcrumbItems.length === 0) {
        return null;
    }

    // Handle max items by showing first, ellipsis, and last items
    let displayItems = breadcrumbItems;
    if (maxItems && breadcrumbItems.length > maxItems) {
        const firstItems = breadcrumbItems.slice(0, 1);
        const lastItems = breadcrumbItems.slice(-(maxItems - 2));
        displayItems = [
            ...firstItems,
            { label: "...", href: null, isEllipsis: true },
            ...lastItems,
        ];
    }

    return (
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <ol className={styles.breadcrumbList}>
                {displayItems.map((item, index) => (
                    <li key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
                        {index < displayItems.length - 1 ? (
                            <>
                                {item.isEllipsis ? (
                                    <span className={styles.breadcrumbEllipsis}>
                                        {item.label}
                                    </span>
                                ) : item.href && !disabledRoutes.includes(item.segment) ? (
                                    <Link href={item.href} className={styles.breadcrumbLink}>
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={styles.breadcrumbText}>{item.label}</span>
                                )}
                                <span className={styles.separator}>/</span>
                            </>
                        ) : (
                            <span className={styles.breadcrumbCurrent} aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
