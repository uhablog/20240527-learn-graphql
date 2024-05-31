"use client";
import { client } from "@/libs/graphql_client"
import { ApolloProvider } from "@apollo/client"

const WithApollo = ({ children }: React.PropsWithChildren) => {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default WithApollo;