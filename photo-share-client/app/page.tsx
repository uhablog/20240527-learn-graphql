import WithApollo from "./components/WithApollo";
import TopPage from "./components/TopPage";

export default function Home() {

  return (
    <>
      <WithApollo>
        <TopPage/>
      </WithApollo>
    </>
  )
}
