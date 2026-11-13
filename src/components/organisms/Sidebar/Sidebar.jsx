"use client";
import LinkLoader from "@/components/atoms/LinkLoader/LinkLoader";
import MenuPopup from "@/components/atoms/MenuPopup/MenuPopup";
import { SIDEBAR_MENU_ITEMS } from "@/resources/constants/constants";
import useDimensions from "@/resources/hooks/useDimensions";
import { mediaURL } from "@/resources/utils/helper";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BiChevronRight, BiDotsVerticalRounded } from "react-icons/bi";
import { useSelector } from "react-redux";
import classes from "./Sidebar.module.css";
import clsx from "clsx";

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const pathname = usePathname();
  const { width } = useDimensions();
  const router = useRouter();
  const isTablet = useMemo(() => width <= 992, [width]);
  const { user } = useSelector((state) => state.authReducer);

  const navigationItems = useMemo(() => SIDEBAR_MENU_ITEMS, []);

  const handleLogout = useCallback(() => {
    // router.replace("/login");
    // clearAllCookies();
  }, [router]);

  useEffect(() => {
    const currentRoute = pathname;
    const allItems = [...navigationItems];

    const currentItem = allItems.find((item) => item.path === currentRoute);
    if (currentItem) {
      setActiveItem(currentItem.title);
      return;
    }
  }, [pathname, navigationItems]);

  return (
    <div className={classes.sidebar}>
      {/* Header Section */}
      <div className={classes.header}>
        <div className={clsx(classes.logo, isTablet && classes.shortLogo)}>
          <Image
            src={isTablet ? "/svgs/short-logo.svg" : "/svgs/logo.svg"}
            alt="Logo"
            fill
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className={classes.navigation}>
        {navigationItems.map((item) => (
          <Link
            key={item.title}
            href={item.path}
            className={`${classes.navItem} ${
              activeItem === item.title ? classes.active : ""
            }`}
            onClick={() => setActiveItem(item.title)}
          >
            <span className={classes.navIcon}>
              <Image
                src={item.icon}
                height={24}
                width={24}
                alt={item.title || "Icon"}
              />
            </span>
            <span className={classes.navLabel}>{item.title}</span>
            <LinkLoader />
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className={classes.userProfile}>
        {isTablet ? (
          <Menu user={user} handleLogout={handleLogout} />
        ) : (
          <>
            <UserDetails user={user} />
            <Menu user={user} handleLogout={handleLogout} />
          </>
        )}
      </div>
    </div>
  );
}

function Menu({ user, handleLogout = () => {} }) {
  const router = useRouter();
  const items = [
    {
      renderItem: () => (
        <UserDetails user={user} className={classes.userDetailsItem} />
      ),
      onClick: () => console.log("Profile clicked"),
    },
    {
      label: "Settings",
      onClick: () => router.push("/settings"),
      renderItem: () => (
        <div className={classes.menuItem}>
          <Image
            src={"/svgs/settings.svg"}
            height={20}
            width={20}
            alt="Settings"
          />
          <span className={classes.menuItemLabel}>Settings</span>
          <BiChevronRight size={20} color="var(--black-3)" />
        </div>
      ),
    },
    {
      label: "Logout",
      renderItem: () => (
        <div className={classes.menuItem}>
          <Image src={"/svgs/logout.svg"} height={20} width={20} alt="Logout" />
          <span
            className={clsx(classes.menuItemLabel, classes.logoutItemLabel)}
          >
            Logout
          </span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <MenuPopup
      portal
      align="end"
      menuButton={
        <BiDotsVerticalRounded className="pointer" size={24} color="#717680" />
      }
      items={items}
      className={classes.menuPopup}
    />
  );
}

function UserDetails({ user = {}, className = "" }) {
  return (
    <div className={clsx(classes.userInfo, className)}>
      <div className={classes.avatar}>
        <Image
          src={mediaURL(user?.logo, "/app-images/default-user.png")}
          alt="User"
          fill
        />
      </div>
      <div className={classes.userDetails}>
        <p className="maxLine1">{user?.fullName || "-"}</p>
        <p className="maxLine1">{user?.email || "-"}</p>
      </div>
    </div>
  );
}
