import { redirect_github_auth } from "@/libs/redirect_githubauth";
import { useState } from "react";

const AuthorizedUser = () => {
  const [ signingIn, setSigninIn ] = useState<boolean>(false);

  const requestCode = () => {
    redirect_github_auth();
  };

  return (
    <>
      <button onClick={requestCode} disabled={signingIn}>
        Sign In with GitHub
      </button>
    </>
  )

};

export default AuthorizedUser;