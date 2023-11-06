import { useRouter } from 'next/router';
import Modal from 'react-modal';

import NavBar from '../../../components/nav/navbar';

import styles from '../../styles/Video.module.css';

import cls from 'classnames';

import { getYoutubeVideoById } from '../../../lib/videos';

Modal.setAppElement('#__next');

export async function getStaticProps(context) {

    // data to fetch from API
    // const video = {
    //     title: "Clifford the Big Red Dog",
    //     publishTime: "2023-01-01",
    //     description: "A big red dog that is super cute, can he get any bigger?",
    //     channelTitle: "Paramount Pictures",
    //     viewCount: 10000,
    // };

    console.log({ context });

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

    const { title, publishTime, description, channelTitle, statistics: { viewCount } = { viewCount: 0 } } = video;

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
                    src={`https://www.youtube.com/embed/${router.query.videoId}?autoplay=0&origin=http://example.com&controls=0&rel=1`}
                    frameBorder="0"
                >
                </iframe>

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