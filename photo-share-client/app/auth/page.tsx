import AuthorizedUser from "../components/AuthorizedUser";
import WithApollo from "../components/WithApollo";

export default function AuthorizeUser() {
  return (
    <>
      <WithApollo>
        <AuthorizedUser/>
      </WithApollo>
    </>
  )
}