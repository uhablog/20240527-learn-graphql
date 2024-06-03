const CLIENT_ID = process.env.CLIENT_ID

export const redirect_github_auth = () => {
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user`;
};