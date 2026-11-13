import { Menu, MenuItem } from "@szhsin/react-menu";
import classes from "./MenuPopup.module.css";
import Link from "next/link";
import LinkLoader from "../LinkLoader/LinkLoader";

export default function MenuPopup({ menuButton, items, value, ...props }) {
  return (
    <>
      <style>
        {`
        .szh-menu__item--hover{
          background-color: inherit !important;
        }
      `}
      </style>
      <Menu
        menuButton={menuButton}
        className={classes.menu}
        {...props}
        onClick={(e) => e.stopPropagation()}
      >
        {items?.map(
          ({ renderItem = null, type = "", href = "#", ...item }, i) => {
            const children = renderItem ? renderItem(value) : item.label;
            return (
              <MenuItem
                key={i}
                onClick={item?.onClick}
                style={item?.style}
                value={value || item?.value}
                type={type}
                {...item}
              >
                {type === "link" ? (
                  <Link href={href}>
                    {children}
                    <LinkLoader />
                  </Link>
                ) : (
                  children
                )}
              </MenuItem>
            );
          }
        )}
      </Menu>
    </>
  );
}
