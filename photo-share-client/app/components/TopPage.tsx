"use client";

import { gql, useQuery } from "@apollo/client";

const query = gql`
  {
    totalUsers
    totalPhotos
  }
`
const TopPage = () => {

  const { data, loading, error} = useQuery(query);

  if (loading) return <>Loading ...</>

  return (
    <>
      { error && <>{error.message}</>}
      Hello Next.js<br/>
      TotalUsers: {data.totalUsers}
    </>
  )
};

export default TopPage;