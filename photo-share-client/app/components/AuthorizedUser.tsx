"use client";
import { redirect_github_auth } from "@/libs/redirect_githubauth";
import { gql, useQuery } from "@apollo/client";
import Image from "next/image";

const ME_QUERY = gql`
  query me {
    me {
      name
      githubLogin
      avatar
    }
  }
`

const AuthorizedUser = () => {

  const { data, loading, error, refetch } = useQuery(ME_QUERY);

  const requestCode = () => {
    redirect_github_auth();
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    refetch();
  }

  if (loading) return <>Loading ...</>
  if (error) return <>エラー発生：{error.message}</>

  return (
    <>
      {
        data.me ?
        <>
          <h1>{data.me.githubLogin}</h1>
          <Image
            src={data.me.avatar}
            alt=""
            width={400}
            height={400}
          />
          <button onClick={logout}>logout</button>
        </>
        : 
        <>
          <button onClick={requestCode}>
            Sign In with GitHub
          </button>
        </>
      }
    </>
  )

};

export default AuthorizedUser;