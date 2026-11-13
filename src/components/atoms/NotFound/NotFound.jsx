import Link from "next/link";
import Button from "../Button";
import styles from "./NotFound.module.css";

/**
 * NotFound component displays a not found message and a button to navigate back.
 *
 * @param {Object} props
 * @param {string} [props.route="#"] - The route to navigate back to.
 * @param {string} [props.heading="404 - Not Found"] - Main heading text.
 * @param {string} [props.title="The page you are looking for does not exist."] - Title text below heading.
 * @param {string} [props.subtitle="Please check the URL or go back to a safe page."] - Subtitle/message text below title.
 * @param {string} [props.buttonLabel="Go Back"] - Label text for the button.
 * @returns {JSX.Element}
 */
export default function NotFound({
  route = "#",
  heading = "404 - Not Found",
  title = "The page you are looking for does not exist.",
  subtitle = "Please check the URL or go back to a safe page.",
  buttonLabel = "Go Back",
}) {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{heading}</h1>
      <h2 className={styles.subheading}>{title}</h2>
      <p className={styles.message}>{subtitle}</p>
      <Link href={route}>
        <Button rounded variant={"primary"} label={buttonLabel} />
      </Link>
    </div>
  );
}
