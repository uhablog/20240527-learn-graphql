import AuthGitHub from "@/app/components/AuthGitHub";
import WithApollo from "@/app/components/WithApollo";

export default function AuthGitHubPage() {

  return (
    <>
      <WithApollo>
        <AuthGitHub />
      </WithApollo>
    </>
  )
}