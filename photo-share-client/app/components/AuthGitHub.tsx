"use client";
import { useMutation, gql } from "@apollo/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GITHUB_AUTH_MUTATION = gql`
  mutation GitHubAuth($code: String!) {
    githubAuth(code: $code) {
      token
      user{
        name
        githubLogin
      }
    }
  }
`;

const AuthGitHub = () => {
  const [githubAuth , { data, loading, error }] = useMutation(GITHUB_AUTH_MUTATION);

  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  const router = useRouter();

  useEffect(() => {

    let isActive = true;

    if (code) {
      githubAuth({ variables: {code}})
        .then(response => {
          if (isActive && response.data.githubAuth.token) {
            // fetch('/api/auth/token', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json'
            //   },
            //   body: JSON.stringify({
            //     token: response.data.githubAuth.token
            //   })
            // })
            // .then( res => {
            //   return res.json();
            // })
            // .then( json => {
            //   console.log(json);
            // })
            // .catch(error => {
            //   console.error(error);
            // });

            sessionStorage.setItem('token', response.data.githubAuth.token);
            router.push('/auth');
          }
        })
        .catch( error => {
          console.error(error);
        });
    }

    return () => {
      isActive = false;
    };
  }, [code, githubAuth]);

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  if (!data || !data.githubAuth || !data.githubAuth.user) return <p>No user data available.</p>;

  // if (data.githubAuth.token) {
  //   document.cookie = `token=${data.githubAuth.token}; HttpOnly; Secure; SameSite; Path=/;`;
  // }

  return (
    <div>
      <h1>Welcome, {data.githubAuth.user.githubLogin}</h1>
    </div>
  )
};

export default AuthGitHub;