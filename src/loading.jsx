import { m } from "./paraglide/messages.js";
export default function LoadingPage() {
  return (
    <div id='error-page' style={{
      backgroundColor: '#203d69',
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <h1>{m["common_strings.loading"]()}...</h1>
    </div>
  );
}
