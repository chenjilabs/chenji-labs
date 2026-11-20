# Chenji Labs: Digital Science Labs

Product Requirements Document. Version 0.1 (draft), 20 November 2026. Status: for review.

## 1. Overview

Chenji Labs is an open source collection of interactive simulations that let learners run science practicals in a web browser. It starts with chemistry, with a focus on physical chemistry concepts, and grows into the other physical sciences.

**Tagline:** The future of digital science labs.

Each experiment is a small, static web page. All experiments live in one GitHub repository, are published together on GitHub Pages, and are built by the project lead and community contributors through reviewed pull requests.

## 2. Problem statement

Remote learning has made practical sessions in the physical sciences close to impossible for many learners. The physical sciences are learned by changing a variable and observing what happens. Without that, learners memorise results instead of understanding them, and concepts do not stick.

The gap for learners and teachers:

- Teachers lack a free, reliable set of experiments they can assign and trust to be scientifically correct.
- Many existing simulators are heavy, need fast connections or accounts, or do not follow the order in which concepts are taught.
- Learners often use entry-level phones on limited data, so large or complex tools are out of reach.

## 3. Vision and mission

**Vision:** a free digital lab where any learner can explore the physical sciences by doing.

**Mission:** build accurate, light, well-explained experiments, ordered from the simplest ideas to the most advanced, and keep them open so that teachers and contributors can improve them.

## 4. Goals and non-goals

### Goals

- G1. Give learners a hands-on way to test physical science concepts without a physical lab.
- G2. Build experiments that are scientifically accurate, with assumptions stated and sources cited.
- G3. Order experiments from easy to complex so a learner can follow a clear path.
- G4. Keep experiments light enough to run on entry-level phones and weak connections.
- G5. Make the code reusable so each new experiment is faster and cheaper to build than the last.
- G6. Run as a healthy open source project with a clear, fair review process.

### Non-goals (for now)

- A learning management system, with accounts, classes or grade books.
- Automatic marking or certification.
- A replacement for in-person labs where they are available.
- 3D or VR labs.
- Collecting personal data about learners.
- A part of the Chenji business platform product. This is a separate, open source project that shares only the Chenji Labs name.

## 5. Users

**Learners** (secondary school to first-year university). They need to see a concept change in front of them, get quick feedback, and use a phone. They are not expected to install anything or sign up.

**Teachers and tutors.** They need experiments that match what they teach, a link they can share, and confidence that the science is right. They need short prompts and questions they can use in a lesson without preparing.

**Contributors.** Students, teachers, developers and scientists who want to add or improve an experiment. They need a template, clear rules and a predictable review.

**Maintainers and reviewers.** They protect scientific accuracy, quality and consistency, and need a review process that does not depend on one person's time.

## 6. Product principles

1. **One concept per experiment.** Small, focused, quick to load and easy to link from a lesson.
2. **Easy to complex.** Every experiment sits on a clear step of the learning path and names its prerequisites.
3. **Accurate before pretty.** A correct, plainly presented model beats an impressive but wrong one. State every simplification.
4. **Light by default.** No heavy libraries, remote fonts or tracking. Design for slow connections and small screens.
5. **Reuse before repeating.** Shared building blocks are extracted when a second experiment needs them.
6. **Open by default.** Public code, public reviews, permissive licence.
7. **No accounts, no tracking.** Learners open a link and start.

## 7. Scope and learning path

Experiments are grouped by subject, and within a subject by step. Chemistry comes first.

**Chemistry learning path**

- **Step 1, Foundations:** periodic table explorer, atomic structure, unit conversion, molar mass.
- **Step 2, Matter:** particle model of solids, liquids and gases; gas laws; concentration and dilution.
- **Step 3, Reactions:** equation balancer; stoichiometry and limiting reagent; pH and acids and bases.
- **Step 4, Change:** titration curves; rates of reaction; chemical equilibrium.
- **Step 5, Energy:** thermodynamics (enthalpy, entropy, Gibbs energy); electrochemistry; Arrhenius kinetics.
- **Step 6, Physical chemistry:** particle in a box; spectroscopy.

Physics and other physical sciences are added as separate subjects once chemistry has a solid base and there is a real need or contributor for them.

### Minimum viable product (MVP)

The MVP is complete when:

- The site is live on GitHub Pages with a landing page grouped by subject.
- At least two experiments exist and share code from the common packages: pH simulator and gas laws.
- Contribution, review and deploy workflows are working.
- At least one teacher or a small group of learners has tried the experiments and given feedback.

## 8. Functional requirements

### 8.1 Every experiment

- FR-E1. Has one clear aim, stated in a sentence at the top of the page.
- FR-E2. Lets the learner change at least one variable with labelled controls and see the result immediately.
- FR-E3. Shows the result in more than one way where useful (for example a number, a colour and a graph), and never relies on colour alone.
- FR-E4. Includes a **What to try** section with prompts the learner can act on, and a short answer they can reveal afterwards.
- FR-E5. Includes a **Science behind this** section with the key equation, its assumptions and limits, and at least one source.
- FR-E6. States the conditions assumed (for example 25 degrees Celsius, ideal gas, a single solute in pure water).
- FR-E7. Keeps the scientific logic in plain functions with automated tests, separate from the interface.
- FR-E8. Works without sign-up, network calls to other sites, or cookies.
- FR-E9. Links back to the landing page and, where relevant, to its prerequisite and next experiments.

### 8.2 Landing page and learning path

- FR-L1. Lists all experiments grouped by subject.
- FR-L2. Orders experiments within a subject by step, and shows each one's level, summary and topics.
- FR-L3. Shows prerequisites so a learner can see what to do first.
- FR-L4. Is generated automatically from experiment metadata at build time, so adding an experiment never requires editing the page by hand.
- FR-L5. Is fast, readable on a phone and fully usable by keyboard.

### 8.3 Experiment metadata

Each experiment has an `app.json` file. The build fails if required fields are missing.

- Required: `title`, `summary`, `level`.
- Planned: `step` (1 to 6), `prerequisites` (a list of experiment names), `tags`, `sources`.
- The subject comes from the folder name, so it is never repeated in the file.

### 8.4 Shared packages

Packages are created when a second experiment needs the same code, and each one has tests.

- **units:** constants, unit conversion, significant-figure formatting.
- **ui:** slider, readout, "What to try" panel, theme, back link.
- **plot:** simple SVG line and scatter graphs for curves such as titration and rate plots.
- **particles:** a particle-box simulation for gas laws, states of matter and kinetics.
- **chem-core:** molar mass, formula parser, equation balancing, stoichiometry.

### 8.5 Contribution and review

- FR-C1. A command creates a new experiment from a template for a given subject: `pnpm new-app <subject> <experiment-name>`.
- FR-C2. Every change comes through a pull request that uses the pull request template (concept and audience, chemistry check, student experience, project rules, sources).
- FR-C3. Continuous integration runs tests and a full build on every pull request. A failing check blocks the merge.
- FR-C4. A maintainer must approve each pull request. Code owners are automatically requested for review.
- FR-C5. Issue forms exist for bug reports and experiment ideas.
- FR-C6. Merging to `main` deploys the site automatically.

## 9. Non-functional requirements

The numbers below are initial targets to be checked against real devices and revised.

- **Performance:** first load of an experiment is 150 KB or less (HTML, JavaScript and CSS), with no web fonts or remote images. It becomes usable within 3 seconds on a mid-range phone on a slow mobile connection.
- **Accessibility:** aim for WCAG 2.1 level AA. All controls are labelled and keyboard operable, text meets contrast guidelines, information is never conveyed by colour alone, and animation respects the reduced-motion setting.
- **Compatibility:** the latest two versions of Chrome, Firefox, Safari and Edge, and Chrome on Android. Layouts work down to 360 px wide.
- **Offline:** experiments are cached for offline use once the first one has loaded (planned, Phase 3).
- **Privacy:** no accounts, cookies, trackers or personal data. Any future usage measurement must be aggregate and privacy-friendly.
- **Security:** no runtime calls to third-party sites. Dependencies are kept small and updated on a schedule.
- **Maintainability:** consistent structure, tests for all scientific logic, and short documentation for every shared package.
- **Internationalisation:** text is kept separate from logic where practical so that translations can be added later.
- **Licence:** code under the MIT licence. Contributors confirm that any images, fonts or text they add are their own or reusable.

## 10. Technical approach

**Stack.** Vite with plain JavaScript for each experiment (TypeScript can be adopted later), pnpm workspaces for the monorepo, SVG and canvas for visuals, and the Node test runner for logic tests. A framework is added only if an experiment truly needs one.

**Repository layout.**

```
apps/
  chemistry/
    ph-simulator/
    gas-laws/
  physics/
packages/
  units/  ui/  plot/  particles/  chem-core/
templates/
  experiment/
scripts/
  build-all.mjs  new-app.mjs  landing.mjs
.github/
  workflows/  ISSUE_TEMPLATE/  PULL_REQUEST_TEMPLATE.md  CODEOWNERS
```

**Build.** A single command builds every experiment into `dist/<subject>/<experiment>/` and generates the landing page from each experiment's metadata. Folders starting with an underscore are ignored.

**Hosting and deploy.** GitHub Pages, deployed by GitHub Actions on every merge to `main`. A repository named `<org>.github.io` is served at the site root; any other name is served under `/<repo>/`. The workflow sets the base path accordingly.

**Testing.** Unit tests for all scientific logic, checked against textbook worked examples and limiting cases. CI runs tests and a full build on every pull request. Visual and accessibility checks are added later.

**Branch protection.** Pull request required, one approval, code owner review, passing `build` check, no force pushes.

## 11. What every experiment contains

1. **Aim:** one sentence on what the learner will explore.
2. **Controls:** labelled inputs with sensible ranges.
3. **Live result:** numbers, visuals and, where it helps, a graph.
4. **Conditions:** the assumptions that apply.
5. **What to try:** two to four prompts, with revealable answers.
6. **Check your understanding:** a short question or two that test the concept.
7. **Science behind this:** equation, assumptions, limits and sources.
8. **Next steps:** links to related experiments.

## 12. Roadmap

**Phase 0, Foundation (complete).** Repository scaffold, pH simulator, test setup, continuous integration, deploy workflow, contribution templates.

**Phase 1, MVP (weeks 1 to 2).**

- Decide the GitHub organisation and repository name, and turn on Pages.
- Extract `units` and `ui` from the pH simulator.
- Build gas laws and the `particles` package.
- Add `step` and `prerequisites` to the metadata and show the learning path on the landing page.
- Try it with one teacher or a small group of learners and collect feedback.

**Phase 2, Core path (weeks 3 to 8).**

- Build steps 1 to 3: periodic table, unit conversion, molar mass, concentration and dilution, equation balancer, stoichiometry.
- Add the `plot` and `chem-core` packages.
- Write contributor onboarding guides and label starter issues.
- Merge the first external pull request.

**Phase 3, Depth (months 3 to 5).**

- Build steps 4 and 5: titration curves, rates, equilibrium, thermodynamics, electrochemistry.
- Add offline support.
- Add short teacher notes for each experiment.

**Phase 4, Reach (month 6 onward).**

- Build step 6: particle in a box, spectroscopy.
- Open the physics subject.
- Add translations and run an accessibility audit.

## 13. Success metrics

These are starting targets to calibrate after the first pilot.

**Learning outcomes**

- In pilots, most learners complete an experiment's "Check your understanding" questions correctly after using it.
- Teachers report they would use the experiment in a lesson again.

**Product quality**

- Every experiment meets the performance and accessibility targets.
- Every scientific function has tests, and no accuracy bug stays open for more than two weeks.

**Community health**

- Number of experiments published, per subject and step.
- Number of external contributors and merged external pull requests.
- Time to first review response of 7 days or less.

**Reach.** Because the project does not track users, reach is measured through teacher feedback, shared links, repository activity and, if adopted later, privacy-friendly aggregate counts. How to measure reach responsibly is an open question (section 16).

## 14. Risks and mitigations

- **Scientific inaccuracy.** A wrong model teaches the wrong thing. *Mitigation:* tests against worked examples, stated assumptions, cited sources, chemistry review before every merge, and an easy way to report errors.
- **Over-simplified models create misconceptions.** *Mitigation:* the "Conditions" and "Science behind this" sections state limits clearly.
- **Scope creep.** Too many subjects and features too soon. *Mitigation:* chemistry first, one step at a time, and no new subject without a real need or a committed contributor.
- **Review bottleneck.** One maintainer cannot review everything. *Mitigation:* code owners, subject reviewers, clear templates and a published review checklist.
- **Low-quality contributions.** *Mitigation:* the template, the pull request checklist, automated checks and a clear definition of done.
- **Poor access.** Slow connections and small phones. *Mitigation:* strict size budget, no remote assets and planned offline support.
- **Platform before product.** Building shared packages that nobody uses. *Mitigation:* extract only when a second experiment needs the code.
- **Maintainer capacity.** The project depends on a small number of people. *Mitigation:* simple tooling, automation, good documentation and an early search for co-maintainers.
- **Brand confusion.** The Chenji Labs name is also used by a separate business product. *Mitigation:* keep the repositories, sites and messaging separate and say clearly what each one is.
- **Asset and licence problems.** *Mitigation:* contributors state the origin and licence of every asset in the pull request.

## 15. Governance and process

**Roles**

- **Project lead:** sets direction and priorities, and approves the roadmap.
- **Maintainers:** review and merge pull requests, and manage releases and issues.
- **Subject reviewers:** check scientific accuracy for their subject.
- **Contributors:** anyone who opens an issue or pull request.

**Pull request flow**

Fork, branch, create the experiment with the template, run tests and build, open a pull request using the template, pass continuous integration, receive review (chemistry first, then usability, then code), and get a maintainer's approval. The change is squash-merged and deployed automatically.

**Conduct.** All participants follow the Code of Conduct. Reviews are about the work, never the person.

## 16. Open questions

1. What is the final GitHub organisation and repository name? It should be settled before links are shared.
2. Which syllabus or syllabi should the first experiments follow most closely?
3. Who will act as the first subject reviewers for chemistry accuracy?
4. How will reach be measured without tracking learners?
5. Which languages should be supported first?
6. When should the project move from JavaScript to TypeScript?
7. Should teacher guides live in the repository or on a separate page?
8. How will the project be sustained over time (time, hosting, funding)?

## Appendix A. Definition of done for an experiment

- Aim, controls, live result, conditions, "What to try", "Check your understanding" and "Science behind this" are all present.
- Scientific logic is in plain functions with passing tests, and sources are cited.
- `app.json` is complete.
- Works at 360 px wide and by keyboard, with labelled controls and sufficient contrast.
- First load is within the size budget, with no external requests.
- Tests and the full build pass in continuous integration.
- A subject reviewer and a maintainer have approved the pull request.

## Appendix B. Example experiment metadata

```json
{
  "title": "Gas laws",
  "summary": "Change pressure, volume and temperature and watch the particles respond.",
  "level": "Secondary school",
  "step": 2,
  "prerequisites": ["particle-model"],
  "tags": ["gases", "Boyle's law", "Charles's law"],
  "sources": ["Textbook or syllabus reference"]
}
```

## Appendix C. Initial backlog

- Done: repository scaffold, pH simulator, continuous integration, deploy workflow, contribution templates.
- Next: shared `units` and `ui` packages, gas laws and `particles`, learning-path fields on the landing page, pilot with a teacher.
- Then: periodic table explorer, unit conversion, molar mass, concentration and dilution, equation balancer.
