"use client";

import { User } from "@/types/User";
import { ApolloCache, ApolloQueryResult, DefaultContext, FetchResult, MutationFunctionOptions, OperationVariables, gql, useMutation, useQuery } from "@apollo/client";
import Image from "next/image";

const query = gql`
  query allUsers {
    totalUsers
    allUsers {
      githubLogin
      name
      avatar
    }
  }
`

const ADD_FAKE_USERS_MUTATION = gql`
  mutation addFakeUsers($count: Int!) {
    addFakeUsers(count:$count) {
      name
      avatar
    }
  }
`

const UsersPage = () => {

  // ユーザーを取得するクエリ
  const { data, loading, error, refetch } = useQuery(query);
  // フェイクユーザーを作成するMutationを実行する
  const [ addFakeUsers, mutationResult ] = useMutation(
    ADD_FAKE_USERS_MUTATION,
    {
      refetchQueries: [
        {query: query},
        'allUsers'
      ],
      awaitRefetchQueries: true
    }
  );

  if (loading) return <>Loading ...</>

  console.log('data is ... ', data);

  return (
    <>
      { error && <>{error.message}</>}
      <UserList
        count={data.totalUsers}
        users={data.allUsers}
        refetch={refetch}
        addFakeUsers={addFakeUsers}
      />
    </>
  )
};

type UserListProps = {
  count: number
  users: [User]
  refetch: () => Promise<ApolloQueryResult<any>>
  addFakeUsers: (options?: MutationFunctionOptions<any, OperationVariables, DefaultContext, ApolloCache<any>>) => Promise<FetchResult>;
}

const UserList = ({ count, users, refetch, addFakeUsers }: UserListProps) => {
  const handleClick = async () => {
   await addFakeUsers({
    variables: {
      count: 1
    }
   });
  }

  return (
    <>
      <p>{count}</p>
      <button onClick={() => refetch()}>Refetch User</button>
      <button onClick={handleClick}>Add Fake Users</button>
      <ul>
        {users.map( user => 
          <UserListItem
            key={user.githubLogin}
            name={user.name}
            avatar={user.avatar}
          />
        )}
      </ul>
    </>
  )
}

type UserListItemProps = {
  name: string
  avatar: string
}

const UserListItem = ({ name, avatar}: UserListItemProps) => {
  return (
    <>
      <li>
        <Image src={avatar} width={48} height={48} alt="" />
        {name}
      </li>
    </>
  )
}


export default UsersPage;