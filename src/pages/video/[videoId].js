import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import cls from 'classnames';

import NavBar from '../../components/nav/navbar';
import Like from '../../components/icons/like-icon';
import DisLike from '../../components/icons/dislike-icon';

import { getYoutubeVideoById } from '../../lib/videos';

import styles from '../../styles/Video.module.css';


Modal.setAppElement('#__next');

export async function getStaticProps(context) {

    const videoId = context.params.videoId;

    const videoArray = await getYoutubeVideoById(videoId);

    return {
        props: {
            video: videoArray.length > 0 ? videoArray[0] : {},
        },
        revalidate: 10, //In seconds
    };
};


export async function getStaticPaths() {
    const listOfVideos = ["4zH5iYM4wJo", "shW9i6k8cB0", "xy1v0pzMP4g"];
    const paths = listOfVideos.map((videoId) => ({
        params: { videoId },
    }));

    return { paths, fallback: 'blocking' };
};


const Video = ({ video }) => {
    const router = useRouter();

    const videoId = router.query.videoId;

    const [toggleLike, setToggleLike] = useState(false);
    const [toggleDislike, setToggleDislike] = useState(false);


    const { title, publishTime, description, channelTitle, statistics: { viewCount } = { viewCount: 0 } } = video;

    useEffect(() => {
        const handleLikeDislikeService = async () => {
            const response = await fetch(`/api/stats?videoId=${videoId}`, {
                method: "GET",
            });
            const data = await response.json();

            if (data.length > 0) {
                const favorited = data[0].favorited;
                if (favorited === 1) {
                    setToggleLike(true);
                } else if (favorited === 0) {
                    setToggleDislike(true);
                };
            };
        };
        handleLikeDislikeService();
    }, [videoId]);

    const runRatingService = async (favorited) => {
        return await fetch('/api/stats', {
            method: 'POST',
            body: JSON.stringify({
                videoId,
                favorited,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    };

    const handleToggleDislike = async () => {
        setToggleDislike(!toggleDislike);
        setToggleLike(toggleDislike);

        const val = !toggleDislike;
        const favorited = val ? 0 : 1;

        const response = await runRatingService(favorited);
    };

    const handleToggleLike = async () => {
        const val = !toggleLike
        setToggleLike(val);
        setToggleDislike(toggleLike);

        const favorited = val ? 1 : 0

        const response = await runRatingService(favorited);
    };

    return (
        <div className={styles.container}>
            <NavBar />
            <Modal
                isOpen={true}
                contentLabel="Watch the video"
                onRequestClose={() => router.back()}
                className={styles.modal}
                overlayClassName={styles.overlay}
            >
                <iframe
                    id="ytplayer"
                    className={styles.videoPlayer}
                    type="text/html"
                    width="100%"
                    height="360"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=0&origin=http://example.com&controls=0&rel=1`}
                >
                </iframe>

                <div className={styles.likeDislikeBtnWrapper}>
                    <div className={styles.likeBtnWrapper}>
                        <button onClick={handleToggleLike}>
                            <div className={styles.btnWrapper}>
                                <Like selected={toggleLike} />
                            </div>
                        </button>
                    </div>
                    <button onClick={handleToggleDislike}>
                        <div className={styles.btnWrapper}>
                            <DisLike selected={toggleDislike} />
                        </div>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.modalBodyContent}>
                        <div className={styles.col1}>
                            <p className={styles.publishTime}>{publishTime}</p>
                            <p className={styles.title}>{title}</p>
                            <p className={styles.description}>{description}</p>
                        </div>
                        <div className={styles.col2}>
                            <p className={cls(styles.subtext, styles.subTextWrapper)}>
                                <span className={styles.textColor}>Channel: </span>
                                <span className={styles.channelTitle}>{channelTitle}</span>
                            </p>
                            <p className={cls(styles.subtext, styles.subTextWrapper)}>
                                <span className={styles.textColor}>View Count: </span>
                                <span className={styles.channelTitle}>{viewCount}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Video;