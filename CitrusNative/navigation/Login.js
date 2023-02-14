import { useContext } from "react";
import { CenteredTitle } from "../components/Text";
import { PageWrapper } from "../components/Wrapper";
import { CurrentUserContext } from "../Context";

export default function Login({}) {

    const { currentUserManager, setCurrentUserManager } = useContext(CurrentUserContext);

    return (
    <PageWrapper>
        <CenteredTitle text="Login" />
    </PageWrapper>
  )
}
