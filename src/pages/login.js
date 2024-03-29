import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

import styles from '../styles/login.module.css';

import { magic } from '../lib/magic-client';

const Login = () => {
    const [email, setEmail] = useState('')
    const [userMsg, setUserMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const handleComplete = () => {
            setIsLoading(false);
        }

        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        }
    }, [router])

    const handleOnChangeEmail = (e) => {
        setUserMsg('');
        const email = e.target.value;
        setEmail(email);
    };

    const handleLoginWithEmail = async (e) => {
        e.preventDefault();

        if (email) {
            // log in a user by their email
            try {
                setIsLoading(true);

                const didToken = await magic.auth.loginWithMagicLink({
                    email,
                });
                if (didToken) {
                    const response = await fetch("api/login", {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${didToken}`,
                            "Content-type": "application/json",
                        },
                    });

                    const loggedInResponse = await response.json();

                    if (loggedInResponse.done) {
                        router.push("/");
                    } else {
                        setIsLoading(false);
                        setUserMsg("Something went wrong loggin in");
                    };
                };
            } catch (error) {
                // Handle errors if required!
                console.error("Something went wrong logging in with Magic", error);
                setIsLoading(false);
            };
        } else {
            // show user message
            setIsLoading(false);
            setUserMsg("Please enter a vaild email address");
        };
    };


    return ( // Rendering Page
        <div className={styles.container}>
            <Head>
                <title>Netflix SignIn</title>
            </Head>

            <header className={styles.header}>
                <div className={styles.headerWrapper}>
                    <Link legacyBehavior className={styles.logoLink} href='/'>
                        <a>
                            <div className={styles.logoWrapper}>
                                <Image src='/static/netflix.svg' alt="Netflix logo" width={128} height={34} />
                            </div>
                        </a>
                    </Link>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.mainWrapper}>
                    <h1 className={styles.signinHeader}> Sign In </h1>

                    <input
                        type="text"
                        placeholder="Enter Email to Sign Up/In"
                        className={styles.emailInput}
                        onChange={handleOnChangeEmail}
                    />

                    <p className={styles.userMsg}>{userMsg}</p>
                    <button onClick={handleLoginWithEmail} className={styles.loginBtn}>
                        {isLoading ? "Loading..." : "Sign In"}
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Login;