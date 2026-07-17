document.addEventListener('DOMContentLoaded', () => {
    // 1. SCROLL SPY & ENTRANCE ANIMATIONS VIA INTERSECTION OBSERVER
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    // Track which sections have been animated to avoid repeating entrance animations
    const animatedSections = new Set();

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');

                // Update Nav
                navItems.forEach(item => item.classList.remove('active'));
                const activeNav = document.querySelector(`.nav-item[href="#${id}"]`);
                if (activeNav) activeNav.classList.add('active');

                // Update URL hash without jumping
                if (history.pushState) {
                    history.replaceState(null, null, '#' + id);
                } else {
                    location.hash = '#' + id;
                }

                // Trigger Section Specific Animations Once
                if (!animatedSections.has(id)) {
                    animatedSections.add(id);
                    triggerEntranceAnimation(id);
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    // 2. ENTRANCE ANIMATIONS FUNCTION
    function triggerEntranceAnimation(sectionId) {
        if (sectionId === 'diplomatie') {
            anime({
                targets: '.terminal-card',
                translateY: [100, 0],
                opacity: [0, 1],
                rotateX: [20, 0],
                delay: anime.stagger(200),
                easing: 'easeOutElastic(1, .8)',
                duration: 1200
            });
        } else if (sectionId === 'statistiques') {
            // Animate stats counter
            anime({
                targets: '#discord-online-count',
                innerHTML: [0, document.getElementById('discord-online-count').getAttribute('data-value') || 42],
                round: 1,
                easing: 'easeInOutExpo',
                duration: 2000
            });
            anime({
                targets: '#discord-member-count',
                innerHTML: [0, document.getElementById('discord-member-count').getAttribute('data-value') || 128],
                round: 1,
                easing: 'easeInOutExpo',
                duration: 2500
            });
            // Animate HUD rings
            anime({
                targets: '.ring-progress',
                strokeDashoffset: [283, 50], // Leaves a little gap to show it's not 100% full, for aesthetic
                delay: anime.stagger(150),
                easing: 'easeOutQuint',
                duration: 2000
            });
            anime({
                targets: '.hud-data',
                scale: [0.8, 1],
                opacity: [0, 1],
                delay: anime.stagger(150),
                easing: 'easeOutBack',
                duration: 1000
            });
        }
    }

    // 3. HERO SECTION ANIMATIONS (Runs on load)
    // Animate subtitle letters
    const subtitle = document.querySelector('.hero-subtitle');
    subtitle.innerHTML = subtitle.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

    anime.timeline({ loop: false })
        .add({
            targets: '.hero-subtitle .letter',
            opacity: [0, 1],
            easing: "easeInOutQuad",
            duration: 100,
            delay: (el, i) => 50 * (i + 1)
        }).add({
            targets: '.text-logo',
            scale: [0.8, 1],
            opacity: [0, 1],
            filter: ['blur(10px)', 'blur(0px)'],
            easing: 'easeOutExpo',
            duration: 1500
        }, '-=1000');

    // Generate Background Circuit Pulse Grid
    const bgContainer = document.querySelector('.circuit-bg');
    const cols = 20;
    const rows = 15;
    for (let i = 0; i < cols * rows; i++) {
        const dot = document.createElement('div');
        dot.classList.add('grid-dot');
        bgContainer.appendChild(dot);
    }

    // Infinite pulsing of background dots mimicking data flow
    anime({
        targets: '.grid-dot',
        opacity: [
            { value: 0, duration: 0 },
            { value: 1, duration: 500 },
            { value: 0, duration: 1500 }
        ],
        backgroundColor: ['#5a0000', '#ff2a2a', '#5a0000'],
        delay: anime.stagger(100, { grid: [cols, rows], from: 'center' }),
        loop: true,
        easing: 'easeInOutSine'
    });

    // 4. HOLOCARTE DYNAMIQUE LOGIC (Section 2)
    const archivesData = [
        { date: "2020-05-12", title: "Alpha Genesis", desc: "The clan was forged in steel and stellar fire. Unbreakable alliance established." },
        { date: "2022-11-04", title: "Proxima War", desc: "Tactical domination on the battlefield. Rebel forces were annihilated." },
        { date: "2024-01-20", title: "The Golden Age", desc: "Absolute control of mining sectors. Economic and military supremacy." },
        { date: "2025-08-15", title: "New Frontier", desc: "Exploration of the outer rims and establishment of the first deep space colony." }
    ];

    // Sort chronologically
    archivesData.sort((a, b) => new Date(a.date) - new Date(b.date));

    const nodesContainer = document.getElementById('holo-nodes-container');
    const laserGrid = document.getElementById('holo-laser-grid');
    const panelContent = document.getElementById('holo-panel-content');

    const centerX = 50;
    const centerY = 50;
    const radiusX = 40;
    const radiusY = 40;


    let prevPosX = null;
    let prevPosY = null;
    const curvePoints = [];

    archivesData.forEach((data, index) => {
        const id = `info-${index}`;
        const laserId = `laser-${index}`;

        // Distribute nodes from left to right chronologically
        const total = archivesData.length;
        // posX goes from 15% to 85% across the screen
        const posX = total > 1 ? 15 + (index / (total - 1)) * 70 : 50;

        // Un "entre-deux": a gentle wave across the middle, alternating between 30% and 70%
        const isTop = index % 2 === 0;
        const randomVariation = Math.random() * 16 - 8; // organic variation (-8% to +8%)
        const posY = isTop ? 30 + randomVariation : 70 + randomVariation;

        // Push point for WebGL Curve
        curvePoints.push(new THREE.Vector3(posX, posY, 0));

        prevPosX = posX;
        prevPosY = posY;

        // Create Node
        const dateStr = data.date.split('-').reverse().join('/');
        const nodeHTML = `
            <div class="holo-node" data-target="${id}" style="top: ${posY}%; left: ${posX}%;">
                <div class="node-core"></div>
                <div class="node-label">
                    <span class="node-date">${dateStr}</span>
                    <span class="node-title">${data.title}</span>
                </div>
            </div>
        `;
        nodesContainer.insertAdjacentHTML('beforeend', nodeHTML);

        // Create Panel
        const panelHTML = `
            <div id="${id}" class="holo-info">
                <h3>${data.title}</h3>
                <p>${data.desc}</p>
            </div>
        `;
        panelContent.insertAdjacentHTML('beforeend', panelHTML);

    });

    let fireWebGLLaser = null;
    let resetWebGLLaser = null;

    // === WEBGL TRUE 3D SPACE & ENERGY STREAKS ===
    const canvas = document.getElementById('webgl-energy');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    const scene = new THREE.Scene();

    // We use a PerspectiveCamera but we mathematically align it so Z=0 matches the DOM pixel coordinates perfectly
    const fov = 60;
    const camera = new THREE.PerspectiveCamera(fov, 1, 1, 4000);

    let w = 100;
    let h = 100;

    function resizeWebGL() {
        const rect = canvas.parentElement.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        // Calculate camera distance to exactly fit height at Z=0
        const dist = (h / 2) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
        camera.position.z = dist;
    }
    window.addEventListener('resize', resizeWebGL);
    resizeWebGL(); // initial sizing

    // Convert percentage nodes to exact 3D coordinates at Z=0
    const curvePoints3D = curvePoints.map(pt => {
        const pxX = (pt.x / 100) * w - w / 2;
        const pxY = -((pt.y / 100) * h - h / 2); // WebGL Y is up
        return new THREE.Vector3(pxX, pxY, 0); // Z=0
    });

    if (curvePoints3D.length > 1) {
        // Curve passing through nodes, but we add some Z depth chaos between nodes
        const POINTS_PER_SEGMENT = 10;

        // Build a sparse array of control points (nodes + midpoints)
        const baseControlPoints = [];
        for (let i = 0; i < curvePoints3D.length - 1; i++) {
            const p1 = curvePoints3D[i];
            const p2 = curvePoints3D[i + 1];
            baseControlPoints.push(p1);

            // Elegant, deterministic midpoint for a smooth 3D arc with a large radius
            const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
            mid.z = 0; // Deeper plunge into Z to force a larger 3D curve

            // Add a large, elegant Y swoop
            const swoopDir = (i % 2 === 0) ? 1 : -1;
            mid.y += swoopDir * 200;
            baseControlPoints.push(mid);
        }
        baseControlPoints.push(curvePoints3D[curvePoints3D.length - 1]);

        // Create a single global curve to ensure C1 continuity (no angles) everywhere
        const globalBaseCurve = new THREE.CatmullRomCurve3(baseControlPoints);
        globalBaseCurve.curveType = 'catmullrom'; // Allows beautiful, large radii
        globalBaseCurve.tension = 0.8; // High tension for wide, majestic curves

        const chronologicalCurvePoints = [];
        const totalIntervals = baseControlPoints.length - 1;

        for (let i = 0; i < curvePoints3D.length - 1; i++) {
            // Each date-to-date segment spans exactly 2 control point intervals in the sparse array
            const startT = (i * 2) / totalIntervals;
            const endT = ((i + 1) * 2) / totalIntervals;

            for (let j = 0; j < POINTS_PER_SEGMENT; j++) {
                const fraction = j / POINTS_PER_SEGMENT;
                const t = startT + fraction * (endT - startT);
                chronologicalCurvePoints.push(globalBaseCurve.getPoint(t));
            }
        }
        chronologicalCurvePoints.push(curvePoints3D[curvePoints3D.length - 1]);

        let startMorphPoints = chronologicalCurvePoints.map(p => p.clone());
        let targetMorphPoints = chronologicalCurvePoints.map(p => p.clone());
        let currentCurvePoints = chronologicalCurvePoints.map(p => p.clone());

        const curve = new THREE.CatmullRomCurve3(currentCurvePoints);
        curve.tension = 0.6;

        // Base Line (faint)
        const lineGeo = new THREE.BufferGeometry().setFromPoints(curve.getSpacedPoints(300));
        const lineMat = new THREE.LineBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const baseEnergyLine = new THREE.Line(lineGeo, lineMat);
        scene.add(baseEnergyLine);

        // Create Moving Streaks ("des traits qui se déplacent")
        const streakCount = 100; // Increased count
        const streaks = [];
        const streakMat = new THREE.LineBasicMaterial({
            color: 0xff5555,
            linewidth: 1, // reduced thickness
            transparent: true,
            opacity: 0.6, // reduced opacity
            blending: THREE.AdditiveBlending
        });

        for (let i = 0; i < streakCount; i++) {
            const geo = new THREE.BufferGeometry();
            // Each streak is composed of 10 points
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(10 * 3), 3));
            const line = new THREE.Line(geo, streakMat);
            scene.add(line);

            streaks.push({
                line: line,
                progress: Math.random(),
                speed: 0.1 + Math.random() * 0.2, // fast speeds
                length: 0.02 + Math.random() * 0.05, // length of the streak on the curve
                offset: Math.random() * 100, // Unique seed for random path
                freq: 0.5 + Math.random() * 1.5 // Unique frequency for chaos
            });
        }

        // Procedural Glow Texture for particles
        const canvasTex = document.createElement('canvas');
        canvasTex.width = 16;
        canvasTex.height = 16;
        const ctx = canvasTex.getContext('2d');
        const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.3, 'rgba(255, 0, 0, 0.8)');
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 16, 16);
        const glowTexture = new THREE.CanvasTexture(canvasTex);

        // Add Floating Particles of multiple sizes along the flow
        const particleSystems = [];
        const sizes = [5, 12, 25];
        const counts = [1000, 500, 200]; // More small, fewer large

        sizes.forEach((size, index) => {
            const geo = new THREE.BufferGeometry();
            const count = counts[index];
            const pos = new Float32Array(count * 3);
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

            const mat = new THREE.PointsMaterial({
                size: size,
                map: glowTexture,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                transparent: true,
                opacity: 0.8 - (index * 0.2) // Larger = more transparent
            });

            const points = new THREE.Points(geo, mat);
            scene.add(points);

            const pData = [];
            for (let i = 0; i < count; i++) {
                pData.push({
                    progress: Math.random(),
                    speed: 0.05 + Math.random() * 0.1,
                    offset: Math.random() * 100,
                    freq: 0.5 + Math.random() * 1.5
                });
            }
            particleSystems.push({ points, count, pData });
        });

        // Morphing State
        let transitionProgress = 1.0;

        fireWebGLLaser = (index) => {
            const startPt = curvePoints3D[index];
            const endPt = new THREE.Vector3(0, 0, 0); // Box center

            // Rebuild targetMorphPoints
            const totalPoints = chronologicalCurvePoints.length;

            // Save current state as starting point
            startMorphPoints = currentCurvePoints.map(p => p.clone());

            for (let i = 0; i < totalPoints; i++) {
                const p = i / (totalPoints - 1); // 0 to 1
                if (p < 0.3) {
                    const angle = i * Math.PI * 0.2; // tighter spiral
                    targetMorphPoints[i].set(
                        startPt.x + Math.cos(angle) * 40,
                        startPt.y + Math.sin(angle) * 40,
                        startPt.z + (p * 50) // funnel in
                    );
                } else if (p < 0.5) {
                    // short chaotic link
                    const t = (p - 0.3) / 0.2; // 0 to 1
                    targetMorphPoints[i].lerpVectors(startPt, endPt, t);
                    targetMorphPoints[i].x += (Math.random() - 0.5) * 40 * Math.sin(t * Math.PI);
                    targetMorphPoints[i].y += (Math.random() - 0.5) * 40 * Math.sin(t * Math.PI);
                    targetMorphPoints[i].z += 100 * Math.sin(t * Math.PI);
                } else {
                    // orbit the entire box (450x350 pixels)
                    const t2 = (p - 0.5) / 0.5; // 0 to 1
                    const angle = t2 * Math.PI * 6; // 3 full orbits
                    targetMorphPoints[i].set(
                        endPt.x + Math.cos(angle) * 265,
                        endPt.y + Math.sin(angle) * 215,
                        endPt.z + Math.cos(angle * 3) * 50 // Adds a 3D figure-8 wave
                    );
                }
            }

            transitionProgress = 0;
        };

        resetWebGLLaser = () => {
            if (transitionProgress >= 1.0 && targetMorphPoints[0].equals(chronologicalCurvePoints[0])) {
                return; // already reset
            }
            startMorphPoints = currentCurvePoints.map(p => p.clone());
            targetMorphPoints = chronologicalCurvePoints.map(p => p.clone());
            transitionProgress = 0;
        };


        const clock = new THREE.Clock();
        function animateWebGL() {
            requestAnimationFrame(animateWebGL);
            const delta = clock.getDelta();
            const time = clock.getElapsedTime();

            // 1. Animate Streaks along the curve with chaotic noise
            streaks.forEach(streak => {
                streak.progress += delta * streak.speed;
                if (streak.progress > 1) streak.progress = 0;

                const positions = streak.line.geometry.attributes.position.array;
                for (let j = 0; j < 10; j++) {
                    let p = streak.progress - (j * (streak.length / 10));
                    if (p < 0) p = 0;
                    const pt = curve.getPointAt(p);

                    let currentX = pt.x + Math.sin(p * 50 * streak.freq + time * 5 + streak.offset) * 15;
                    let currentY = pt.y + Math.cos(p * 40 * streak.freq - time * 4 + streak.offset) * 15;
                    let currentZ = pt.z + Math.sin(p * 30 * streak.freq + time * 3 + streak.offset) * 15;

                    curvePoints3D.forEach(nodePt => {
                        let dx = currentX - nodePt.x;
                        let dy = currentY - nodePt.y;
                        let dz = currentZ - nodePt.z;
                        let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                        const bubbleRadius = 40;
                        if (dist < bubbleRadius) {
                            if (dist < 0.001) { dx = Math.sin(streak.offset); dy = Math.cos(streak.offset); dist = 1; }
                            const pushAmount = bubbleRadius - dist;
                            currentX += (dx / dist) * pushAmount;
                            currentY += (dy / dist) * pushAmount;
                            currentZ += (dz / dist) * pushAmount;
                        }
                    });

                    positions[j * 3] = currentX;
                    positions[j * 3 + 1] = currentY;
                    positions[j * 3 + 2] = currentZ;
                }
                streak.line.geometry.attributes.position.needsUpdate = true;
            });

            // 2. Animate Particles along the curve
            particleSystems.forEach(sys => {
                const positions = sys.points.geometry.attributes.position.array;
                for (let i = 0; i < sys.count; i++) {
                    const data = sys.pData[i];
                    data.progress += delta * data.speed;
                    if (data.progress > 1) data.progress = 0;

                    const pt = curve.getPointAt(data.progress);

                    let currentX = pt.x + Math.sin(data.progress * 50 * data.freq + time * 5 + data.offset) * 15;
                    let currentY = pt.y + Math.cos(data.progress * 40 * data.freq - time * 4 + data.offset) * 15;
                    let currentZ = pt.z + Math.sin(data.progress * 30 * data.freq + time * 3 + data.offset) * 15;

                    curvePoints3D.forEach(nodePt => {
                        let dx = currentX - nodePt.x;
                        let dy = currentY - nodePt.y;
                        let dz = currentZ - nodePt.z;
                        let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                        const bubbleRadius = 40;
                        if (dist < bubbleRadius) {
                            if (dist < 0.001) { dx = 1; dist = 1; }
                            const pushAmount = bubbleRadius - dist;
                            currentX += (dx / dist) * pushAmount;
                            currentY += (dy / dist) * pushAmount;
                            currentZ += (dz / dist) * pushAmount;
                        }
                    });

                    positions[i * 3] = currentX;
                    positions[i * 3 + 1] = currentY;
                    positions[i * 3 + 2] = currentZ;
                }
                sys.points.geometry.attributes.position.needsUpdate = true;
            });

            // 3. Morphing Curve Transition
            if (transitionProgress < 1.0) {
                transitionProgress += delta * 0.7; // Slower, more progressive
                if (transitionProgress >= 1.0) transitionProgress = 1.0;

                // Ease Out Quintic effect: Instant start (no delay) with very long, smooth deceleration
                const t = transitionProgress;
                const ease = 1 - Math.pow(1 - t, 5);

                for (let i = 0; i < currentCurvePoints.length; i++) {
                    currentCurvePoints[i].lerpVectors(startMorphPoints[i], targetMorphPoints[i], ease);
                }

                // Update Curve lengths to ensure particles map correctly
                curve.updateArcLengths();
                // Update Base Red Line
                baseEnergyLine.geometry.setFromPoints(curve.getSpacedPoints(300));
            }

            renderer.render(scene, camera);
        }
        animateWebGL();
    }

    // Background click or Close button click to reset
    const closePanel = () => {
        if (resetWebGLLaser) resetWebGLLaser();
        document.querySelectorAll('.holo-info').forEach(p => {
            p.classList.remove('active');
            anime({ targets: p, opacity: 0, scale: 0.9, filter: 'blur(10px)', duration: 400 });
        });
        const panel = document.querySelector('.holo-display-panel');
        if (panel) panel.classList.remove('active');
    };

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.holo-node') && !e.target.closest('.holo-display-panel') && !e.target.closest('.holo-info')) {
            closePanel();
        }
    });

    const closeBtn = document.getElementById('close-holo-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closePanel);
    }

    const holoNodes = document.querySelectorAll('.holo-node');
    const holoInfos = document.querySelectorAll('.holo-info');

    holoNodes.forEach((node) => {
        node.addEventListener('click', () => {
            const targetId = node.getAttribute('data-target');
            const index = parseInt(targetId.split('-')[1]);

            holoInfos.forEach(p => p.classList.remove('active'));

            if (fireWebGLLaser) fireWebGLLaser(index);

            const panel = document.querySelector('.holo-display-panel');
            if (panel) panel.classList.add('active');

            const tl = anime.timeline({ easing: 'easeInOutSine' });

            tl.add({
                targets: `#${targetId}`,
                opacity: [0, 1],
                scale: [0.9, 1],
                filter: ['blur(10px)', 'blur(0px)'],
                duration: 600,
                begin: () => {
                    document.getElementById(targetId).classList.add('active');
                }
            }, '-=400');
        });
    });

    // 5. TERMINAL 3D MOUSEMOVE (Section 3)
    const terminals = document.querySelectorAll('.terminal-card');
    terminals.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -15; // max 15 deg
            const rotateY = ((x - centerX) / centerX) * 15;

            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // 5. DISCORD API FETCH (Stats Placeholder)
    const discordServerId = '1400222087242580119';
    const onlineCountEl = document.getElementById('discord-online-count');

    if (discordServerId !== 'YOUR_SERVER_ID') {
        fetch(`https://discordapp.com/api/guilds/${discordServerId}/widget.json`)
            .then(response => response.json())
            .then(data => {
                if (data && data.presence_count !== undefined) {
                    onlineCountEl.setAttribute('data-value', data.presence_count);
                }
            })
            .catch(error => console.error("Erreur chargement Discord:", error));
    } else {
        onlineCountEl.setAttribute('data-value', 42); // Placeholder mock value for animation
    }
});
