const fileInput = document.getElementById('fileInput');
const video = document.getElementById('video');
const screenshotsContainer = document.getElementById('screenshots');
const downloadPPTBtn = document.getElementById('downloadPPTBtn');
const playStatus = document.getElementById('playStatus'); // 播放状态提示元素
const conversionStatus = document.getElementById('conversionStatus'); // 转换状态提示元素

let videoBlob;
let screenshots = [];
let previousImageData = null;
const captureInterval = 5; // Capture every 5 seconds
const maxScreenshots = 256; // 保留最大PPT页数
let noNewScreenshotCount = 0; // 连续未产生新截图的计数器

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    const fileReader = new FileReader();

    fileReader.onload = () => {
        videoBlob = new Blob([fileReader.result], { type: file.type });
        video.src = URL.createObjectURL(videoBlob);
        video.muted = true;
        video.load();
        video.play();
    };

    fileReader.readAsArrayBuffer(file);
});

video.addEventListener('loadeddata', () => {
    playStatus.classList.remove('d-none'); // 显示播放状态
    video.play();
    captureScreenshots();
});

video.addEventListener('play', () => {
    playStatus.classList.remove('d-none'); // 显示播放状态
});

video.addEventListener('pause', () => {
    playStatus.classList.add('d-none'); // 隐藏播放状态
});

video.addEventListener('ended', () => {
    playStatus.classList.add('d-none'); // 隐藏播放状态
    downloadPPTBtn.classList.remove('d-none'); // 显示下载按钮
});

function calculateImageDifference(imgData1, imgData2) {
    let sumOfSquares = 0;
    const length = imgData1.data.length;

    for (let i = 0; i < length; i += 4) {
        const r = imgData1.data[i];
        const g = imgData1.data[i + 1];
        const b = imgData1.data[i + 2];
        const luminance1 = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        const r2 = imgData2.data[i];
        const g2 = imgData2.data[i + 1];
        const b2 = imgData2.data[i + 2];
        const luminance2 = 0.2126 * r2 + 0.7152 * g2 + 0.0722 * b2;

        const diff = luminance1 - luminance2;
        sumOfSquares += diff * diff;
    }

    let avgSquareDiff = sumOfSquares / (length / 4);
    return Math.sqrt(avgSquareDiff);
}

function captureScreenshots() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let currentTime = 0;
    const totalDuration = video.duration;

    function captureFrame() {
        video.currentTime = currentTime;

        video.onseeked = () => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);

            if (previousImageData) {
                const difference = calculateImageDifference(previousImageData, currentImageData);
                if (difference > 30) {
                    canvas.toBlob(blob => {
                        blob.metadata = { difference: difference };
                        screenshots.push(blob);
                        displayScreenshot(blob);
                        noNewScreenshotCount = 0; // 重置计数器
                    }, 'image/jpeg');
                } else {
                    noNewScreenshotCount++;
                }
            } else {
                canvas.toBlob(blob => {
                    blob.metadata = { difference: 0 };
                    screenshots.push(blob);
                    displayScreenshot(blob);
                    noNewScreenshotCount = 0; // 重置计数器
                }, 'image/jpeg');
            }

            previousImageData = currentImageData;

            if (noNewScreenshotCount >= 10) {
                playStatus.classList.add('d-none'); // 隐藏播放状态
                downloadPPTBtn.classList.remove('d-none'); // 显示下载按钮
            }

            currentTime += captureInterval;
            if (currentTime <= totalDuration) {
                captureFrame();
            } else {
                console.log('Screenshots capture completed.');
            }
        };
    }

    captureFrame();
}

function displayScreenshot(blob) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    img.width = 200;
    img.style.margin = '0 10px'; // 添加左右外边距
    screenshotsContainer.appendChild(img);

    if (screenshotsContainer.children.length > 5) {
        screenshotsContainer.removeChild(screenshotsContainer.firstChild);
    }
}

downloadPPTBtn.addEventListener('click', () => {
    createAndDownloadPPT();
});

function createAndDownloadPPT() {
    conversionStatus.classList.remove('d-none'); // 显示转换状态
    const pptx = new PptxGenJS();

    if (screenshots.length === 0) {
        alert('请先录制视频');
        conversionStatus.classList.add('d-none'); // 隐藏转换状态
    } else {
        if (screenshots.length <= maxScreenshots) {
            screenshots.forEach((screenshot, index) => {
                const slide = pptx.addSlide();
                const screenshotUrl = URL.createObjectURL(screenshot);
                slide.addImage({
                    path: screenshotUrl,
                    x: 0,
                    y: 0,
                    w: '100%',
                    h: '100%'
                });
            });
        } else {
            const sortedScreenshots = screenshots.sort((a, b) => {
                const differenceA = a.metadata ? a.metadata.difference : 0;
                const differenceB = b.metadata ? b.metadata.difference : 0;
                return differenceB - differenceA;
            }).slice(0, maxScreenshots);

            sortedScreenshots.forEach((screenshot, index) => {
                const slide = pptx.addSlide();
                const screenshotUrl = URL.createObjectURL(screenshot);
                slide.addImage({
                    path: screenshotUrl,
                    x: 0,
                    y: 0,
                    w: '100%',
                    h: '100%'
                });
            });
        }

        const now = new Date();
        const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        const fileName = `Ai4Lecture_${timestamp}.pptx`;

        pptx.writeFile({ fileName: fileName })
            .then(() => {
                downloadPPTBtn.style.display = 'inline-block';
                conversionStatus.classList.add('d-none'); // 隐藏转换状态
            })
            .catch(error => {
                console.error('Error creating file:', error);
                conversionStatus.classList.add('d-none'); // 隐藏转换状态
            });
    }
}










