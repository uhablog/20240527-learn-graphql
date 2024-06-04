import PhotosPage from "../components/Photos";
import WithApollo from "../components/WithApollo";

export default function Photos() {
  return (
    <WithApollo>
      <PhotosPage/>
    </WithApollo>
  )
};