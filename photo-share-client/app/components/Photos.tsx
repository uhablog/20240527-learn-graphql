"use client";

import { Photo } from "@/types/Photo";
import { gql, useMutation, useQuery } from "@apollo/client";

const query = gql`
  query allPhotos {
    allPhotos {
      name
      description
      url
      postedBy {
        name
        avatar
        githubLogin
      }
    }
  }
`

const POST_PHOTO_MUTATION = gql`
  mutation postPhoto($input: PostPhotoInput!) {
    postPhoto(input: $input) {
      id
      name
      description
      url
      postedBy {
        name
        githubLogin
        avatar
      }
    }
  }
`

const PhotosPage = () => {
  const { data, loading, error, refetch } = useQuery(query);
  const [ postPhoto, mutationResult] = useMutation(POST_PHOTO_MUTATION);

  if (loading) return <>Loading...</>
  if (error) return <>{error.message}</>

  return (
    <>
      {data.allPhotos.map( (photo: Photo) => {
        return (
          <div key={photo.url}>
            <h1>Photo Name: {photo.name}</h1>
            <p>{photo.description}</p>
            <h2>Posted BY: {photo.postedBy.githubLogin}</h2>
            <br/>
          </div>
        )
      })}
    </>
  )
};

export default PhotosPage;