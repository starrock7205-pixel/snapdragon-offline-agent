import { KnowledgeDocument } from '../types/knowledge';

export const DEFAULT_OFFLINE_DOCUMENTS: Omit<KnowledgeDocument, 'chunks'>[] = [
  {
    id: 'doc-marine-algae-bioactives',
    title: 'Marine_Algal_Derived_Bioactives_A_New_Wave_of_Remediators.pdf',
    fileType: 'pdf',
    fileSize: 64200,
    uploadedAt: Date.now() - 86400000,
    collectionName: 'Marine Biology & Ecology',
    isIndexed: true,
    content: `MARINE ALGAL DERIVED BIOACTIVES: A NEW WAVE OF REMEDIATORS & SURVIVAL ENGINES
RESEARCH JOURNAL OF ENVIRONMENTAL BIOTECHNOLOGY & APPLIED PHYCOLOGY (OCT 2026)

ABSTRACT:
Marine macroalgae (seaweeds) and microalgae represent one of planet Earth's most critical yet underutilized biological frontiers. Often misunderstood in lay discourse simply as "nuisance weed" or confused with terrestrial mosses, these photosynthetic marine organisms are fundamental keystones to global biosphere equilibrium, human nutritional security, and pharmaceutical innovation. This review comprehensively assesses their role as primary trophic foundation, their carbon sequestration dynamics surpassing terrestrial ecosystems, their heavy metal hyperaccumulation bio-sorption mechanisms, and novel bioactive isolates (fucoidans, laminarins, alginates, phlorotannins) driving modern therapeutics.

1. BIOLOGICAL TAXONOMY & CLARIFICATION
Marine algae are photosynthetic eukaryotic or prokaryotic (cyanobacteria) organisms distinct from terrestrial plants. 
- Classification: Chlorophyta (green algae), Phaeophyceae (brown algae such as kelp and Sargassum), and Rhodophyta (red algae such as Porphyra/Nori).
- Common Student Pitfall: They lack true roots, stems, leaves, and vascular xylem/phloem. Instead, they absorb water and dissolved nutrients directly across their entire thallus tissue using holdfasts merely for mechanical substrate anchoring.

2. NUTRITIONAL COMPOSITION & ESSENTIAL TRACE BIO-AVAILABILITY
Marine macroalgae serve as dense nutrient sinks:
- High biological value proteins containing all 9 essential amino acids (up to 47% dry weight in red algae).
- Mineral reservoir: Rich in iodine (critical for thyroid endocrine function, up to 30,000x seawater concentration), magnesium, calcium, iron, and potassium.
- Essential lipid profiles: High concentrations of polyunsaturated fatty acids (EPA, DHA) and powerful antioxidant carotenoids such as Fucoxanthin and Astaxanthin.

3. ECOSYSTEM SERVICES: THE REAL SURVIVAL ENGINE & BLUE CARBON
Marine algae represent the planet's primary photosynthetic oxygen generator:
- Oxygen Production: Marine phytoplankton and macroalgal forests produce over 50% of the Earth's atmospheric oxygen (O2), generating more net oxygen than all terrestrial rainforests combined.
- Blue Carbon Sequestration: Macroalgae sequester carbon at rates up to 20 to 30 times faster per hectare than terrestrial tropical forests. Dead algal biomass sinks into deep abyssal pelagic zones (below 1000m), locking carbon away for geological centuries.
- Coastal Wave Attenuation: Kelp forests attenuate incoming storm surges and reduce coastal erosion by up to 60%.

4. BIOREMEDIATION & HEAVY METAL BIO-SORPTION
Algal cell walls possess abundant anionic functional groups (carboxyl, sulfate, hydroxyl in alginate and fucoidan):
- Hyperaccumulation of toxic divalent metal ions (Pb²⁺, Cd²⁺, As³⁺, Hg²⁺) via passive biosorption and intracellular metallothionein chelation.
- Wastewater treatment: Algal bioreactors efficiently scavenge agricultural runoff (nitrogen and phosphorus eutrophication mitigation).

5. PHARMACEUTICAL BIOACTIVES & THERAPEUTIC MECHANISMS
- Fucoidan: Sulfated polysaccharide with potent antithrombotic, anti-inflammatory, and apoptotic activity against malignant cell lines.
- Laminarin: β-glucan stimulating innate macrophage immunity.
- Phlorotannins: Polyphenolic compounds with higher antioxidant free-radical scavenging capacity than terrestrial green tea catechins.

6. HIGH-YIELD MIDTERM STUDY QUESTIONS & COMMON ASSIGNMENT TRAPS
Trap 1: Confusing marine algae with freshwater moss. Mosses are bryophytes with simple rhizoids; algae are predominantly marine thallophytes.
Trap 2: Claiming Amazon rainforest produces most of Earth's oxygen. Amazon produces ~6-9% net; marine phytoplankton produces >50%.
Trap 3: Assuming all algae are edible. While many are superfoods, cyanobacterial blooms (e.g. Microcystis) produce dangerous microcystin hepatotoxins.`
  },
  {
    id: 'doc-physics-laws-motion',
    title: 'Laws_of_Motion_Summary.pdf',
    fileType: 'pdf',
    fileSize: 48200,
    uploadedAt: Date.now() - 86400000 * 2,
    collectionName: 'Physics Prep',
    isIndexed: true,
    content: `NEWTONIAN DYNAMICS & LAWS OF MOTION - CHAPTER 4 SUMMARY

1. FIRST LAW (LAW OF INERTIA)
Every object continues in its state of rest, or of uniform velocity in a straight line, unless acted upon by a net non-zero external resultant force: ΣF = 0 implies dv/dt = 0.
Inertia is the inherent tendency of an object to resist changes in its velocity. Mass (m) in kilograms is the quantitative scalar measure of inertia.

2. SECOND LAW (FORCE & MOMENTUM)
The rate of change of linear momentum of an object is directly proportional to the applied resultant force and occurs in the direction of the force:
F_net = dp/dt = d(mv)/dt.
When mass remains invariant over time: F_net = m * a.
SI unit of force is the Newton (1 N = 1 kg·m/s²).
Impulse (J) is defined as the integral of force over time interval Δt: J = ∫ F dt = Δp = m(v_final - v_initial).

3. THIRD LAW (ACTION & REACTION)
When entity A exerts a force F_AB on entity B, entity B simultaneously exerts an equal and opposite force F_BA on entity A:
F_AB = - F_BA.
Crucial insight: Action and reaction forces act on DIFFERENT bodies, which is why they never cancel each other out internally.

4. FRICTION FORCES
Static friction: f_s <= μ_s * N (where N is normal contact force, μ_s is coefficient of static friction). Maximum static friction is the limiting friction.
Kinetic friction: f_k = μ_k * N (acts opposite to the instantaneous relative sliding velocity). Generally, μ_k < μ_s.
Rolling friction is significantly lower than sliding friction, which forms the physical basis for ball bearings in mechanical engineering.

5. CIRCULAR DYNAMICS & CENTRIPETAL ACCELERATION
For uniform circular motion of radius r at tangential speed v:
Centripetal acceleration a_c = v² / r = ω² * r, directed radially inward toward the instantaneous center of curvature.
Required net centripetal force: F_c = m * v² / r.
Banking of roads: tan(θ) = v² / (r * g) for optimum frictionless banking angle θ.`
  },
  {
    id: 'doc-optics-refraction',
    title: 'Refraction_and_Optics_Notes.txt',
    fileType: 'txt',
    fileSize: 31400,
    uploadedAt: Date.now() - 86400000 * 3,
    collectionName: 'Physics Prep',
    isIndexed: true,
    content: `WAVE OPTICS & GEOMETRICAL REFRACTION NOTES

1. SNELL'S LAW OF REFRACTION
When an electromagnetic wave traverses the planar interface between two optical media of refractive indices n1 and n2:
n1 * sin(θ1) = n2 * sin(θ2)
where θ1 is angle of incidence and θ2 is angle of refraction, both measured relative to the surface normal.
Absolute refractive index n = c / v, where c is speed of light in vacuum (~3.0 x 10^8 m/s) and v is phase velocity in the dielectric medium.

2. TOTAL INTERNAL REFLECTION (TIR)
Occurs when light travels from a denser optical medium (higher n1) into a rarer optical medium (lower n2) and the incidence angle exceeds the critical angle θ_c:
sin(θ_c) = n2 / n1.
If θ1 > θ_c, 100% of incident radiant power is reflected back into the denser medium with zero transmission loss.
Engineering applications: fiber optic telecommunications, medical endoscopes, binocular porro prisms.

3. DISPERSION IN TRIANGULAR PRISMS
Because refractive index depends inversely on wavelength (Cauchy's equation n(λ) ≈ A + B/λ²), violet light (λ ~ 400 nm) has a higher refractive index than red light (λ ~ 700 nm).
Consequently, violet light refracts through a larger angle of deviation than red light, dispersing polychromatic white light into its spectral continuum.
Angle of minimum deviation δ_m satisfies:
n = sin((A + δ_m) / 2) / sin(A / 2), where A is the prism apex angle.`
  },
  {
    id: 'doc-kinematics-transcript',
    title: 'Lecture_04_Kinematics_Transcript.md',
    fileType: 'transcript',
    fileSize: 52100,
    uploadedAt: Date.now() - 86400000,
    collectionName: 'Lecture Notes',
    isIndexed: true,
    content: `TRANSCRIPT: PROFESSOR V. K. RAMAN - ADVANCED KINEMATICS & MOMENTUM CONSERVATION (RECORDED OCT 14)

[00:01:15] Professor: Welcome everyone. Settle down. Tomorrow's midterm examination will strictly focus on 3 core domains: non-inertial reference frames, conservation of linear and angular momentum, and the projectile trajectory equations with air drag approximations.

[00:04:30] Professor: Remember what students miss every single year: in an accelerating elevator or non-inertial reference frame of acceleration a_frame, you MUST introduce a pseudo-force (fictitious inertial force) equal to -m * a_frame opposite to the frame's acceleration vector.

[00:09:45] Student question: "Sir, what about 2D projectile range on an inclined plane?"
[00:10:10] Professor: Excellent question. For an inclined plane of slope α with launch angle θ relative to the incline:
The range along the plane R = (u² / (g * cos²α)) * [sin(2θ + α) - sin(α)].
Take special note of the maximum range condition: θ = (π/4) - (α/2). This will definitely appear in Section B!

[00:18:22] Professor: Now onto ballistic collisions. In perfectly inelastic collisions, kinetic energy is NOT conserved; it is dissipated into thermal and acoustic vibrational modes. But total linear momentum Σp is ALWAYS conserved in the absence of net external impulses.

[00:26:00] Professor: Final reminder for tomorrow: please review the coefficient of restitution e = (v2 - v1) / (u1 - u2). For perfectly elastic collisions e = 1; for completely sticky inelastic collisions e = 0.`
  },
  {
    id: 'doc-past-questions',
    title: 'Physics_Past_Exam_Questions_2025.txt',
    fileType: 'txt',
    fileSize: 22800,
    uploadedAt: Date.now() - 86400000 * 5,
    collectionName: 'Physics Prep',
    isIndexed: true,
    content: `PHYSICS DEPARTMENT MIDTERM EXAMINATION (PAST YEAR ARCHIVE)

PROBLEM 1: A 1200 kg vehicle navigates a curved roadway of radius r = 85 m banked at angle θ = 18°. If the pavement is icy (μ_s = 0.08), calculate the maximum safe velocity without skidding up the incline.
Key formulas: F_c = m*v²/r, N*cos(θ) - f_s*sin(θ) = m*g, N*sin(θ) + f_s*cos(θ) = m*v²/r.

PROBLEM 2: An optical ray strikes an equilateral glass prism (apex angle A = 60°, refractive index n = 1.54) at normal incidence to the first face. Determine if total internal reflection occurs at the second face when submerged in water (n_water = 1.33).
Critical angle condition: sin(θ_c) = 1.33 / 1.54 = 0.8636 => θ_c = 59.7°.

PROBLEM 3: Two masses m1 = 3 kg and m2 = 5 kg are coupled over a frictionless massless pulley in an Atwood machine placed inside a rocket accelerating vertically upwards at a = 2.5 m/s². Determine the tension T in the string.
Effective gravity g_eff = g + a = 9.8 + 2.5 = 12.3 m/s².`
  },
  {
    id: 'doc-fourier-signals-chapter12',
    title: 'Fourier_Transform_Signals_and_Systems_Chapter12.pdf',
    fileType: 'pdf',
    fileSize: 52400,
    uploadedAt: Date.now() - 86400000 * 3,
    collectionName: 'Signals & Systems',
    isIndexed: true,
    content: `CHAPTER 12: CONTINUOUS & DISCRETE FOURIER TRANSFORM
QUALCOMM SNAPDRAGON OFFLINE AI STUDY SUITE (TEXTBOOK CHAPTER 12)

1. THE FUNDAMENTAL MAPPING PRINCIPLE
The Fourier Transform maps continuous-time signals x(t) into their continuous frequency-domain representations X(ω):
X(ω) = ∫_{-∞}^{∞} x(t) · e^{-jωt} dt

Inverse Transform:
x(t) = (1 / 2π) ∫_{-∞}^{∞} X(ω) · e^{jωt} dω

Core Axiom: "...the Fourier transform maps time to frequency..." Any arbitrary physical signal can be synthesized as a linear superposition of orthogonal complex sinusoids.

2. CONVOLUTION IN FREQUENCY DOMAIN
One of the most powerful properties of the Fourier Transform in linear time-invariant (LTI) signal processing:
Time-domain convolution: y(t) = x(t) * h(t)
Frequency-domain multiplication: Y(ω) = X(ω) · H(ω)
This converts costly $O(N^2)$ convolution operations into instantaneous $O(N)$ spectral multiplications.

3. NYQUIST-SHANNON SAMPLING THEOREM
To sample a continuous band-limited signal with maximum frequency f_max without spectral aliasing:
Sampling Frequency: f_s >= 2 · f_max
Nyquist Rate = 2 · f_max
Nyquist Interval = 1 / (2 · f_max)

4. DISCRETE FOURIER TRANSFORM (DFT) & FFT ALGORITHMS
In digital signal processing on Qualcomm Snapdragon Hexagon NPU:
X[k] = ∑_{n=0}^{N-1} x[n] · W_N^{kn}, where W_N = e^{-j(2π/N)}
The Cooley-Tukey Fast Fourier Transform (FFT) reduces computational complexity from O(N^2) to O(N log N), which runs accelerated on Hexagon Vector eXtensions (HVX).`
  },
  {
    id: 'doc-search-engine-code',
    title: 'project/src/search_engine.py',
    fileType: 'code',
    fileSize: 18400,
    uploadedAt: Date.now() - 86400000 * 4,
    collectionName: 'Coding Project',
    isIndexed: true,
    content: `"""
Local BM25 Inverted Search Engine
Module for offline document ranking and fast keyword lookup.
"""
import math
from typing import List, Dict, Tuple

class OfflineSearchEngine:
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.doc_lengths: Dict[str, int] = {}
        self.avg_doc_len: float = 0.0
        self.inverted_index: Dict[str, Dict[str, int]] = {}
        self.documents: Dict[str, str] = {}

    def add_document(self, doc_id: str, text: str) -> None:
        tokens = text.lower().split()
        self.documents[doc_id] = text
        self.doc_lengths[doc_id] = len(tokens)
        
        for token in tokens:
            if token not in self.inverted_index:
                self.inverted_index[token] = {}
            self.inverted_index[token][doc_id] = self.inverted_index[token].get(doc_id, 0) + 1
            
        # Recalculate average document length
        total_len = sum(self.doc_lengths.values())
        # BUG: Off-by-one division when indexing empty documents or single-doc batch
        # self.avg_doc_len = total_len / (len(self.doc_lengths) - 1)  # <-- ZeroDivisionError on 1st doc!
        self.avg_doc_len = total_len / (len(self.doc_lengths) - 1)

    def query(self, query_text: str, top_k: int = 5) -> List[Tuple[str, float]]:
        scores: Dict[str, float] = {}
        query_terms = query_text.lower().split()
        N = len(self.documents)
        
        for term in query_terms:
            if term not in self.inverted_index:
                continue
            df = len(self.inverted_index[term])
            idf = math.log((N - df + 0.5) / (df + 0.5) + 1.0)
            
            for doc_id, tf in self.inverted_index[term].items():
                doc_len = self.doc_lengths.get(doc_id, 1)
                denom = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / max(1.0, self.avg_doc_len)))
                score_term = idf * (tf * (self.k1 + 1.0)) / denom
                scores[doc_id] = scores.get(doc_id, 0.0) + score_term
                
        sorted_results = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_results[:top_k]
`
  }
];
