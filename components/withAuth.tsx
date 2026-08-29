import { useSession, signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NextComponentType } from "next";

const withAuth = (WrappedComponent: NextComponentType) => {
  const ComponentWithAuth = (props: any) => {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
      if (session.status === "unauthenticated") {
        console.log("1 hit");
        
        signIn();
      }
    }, [session.status]);

    if (session.status === "loading") {
        console.log("2 hit");

      return <div>Loading...</div>;
    }

    if (session.data) {
        console.log("3 hit");
      return <WrappedComponent {...props} />;
    }

    return null;
  };

  return ComponentWithAuth;
};

export default withAuth;
