import UsersPage from "../components/Users";
import WithApollo from "../components/WithApollo";

export default function Users() {
  return (
    <>
      <WithApollo>
        <UsersPage/>
      </WithApollo>
    </>
  )
}