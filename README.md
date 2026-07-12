# EduSolve — Assignment Help Portal

EduSolve is a decoupled web application designed for university students to request tutoring assistance, share assignment parameters, interact securely with verified tutors, and process milestone-based escrow payments. 

This repository relies on the decoupled, multi-tenant headless database engine **ApexKit** and its official `@apexkit/sdk` client library to handle relational data storage, real-time messaging, file uploads, and search indexing.

---

## 1. System Overview

The EduSolve portal facilitates a structured collaborative lifecycle between two user roles: **Students** and **Tutors**. 

### Core Workflows
* **Syllabus & Course Cataloging:** Educational materials and tutoring requests are categorized under specific subject codes (e.g., `CS 101`, `MATH 201`) maintained by system administrators.
* **Escrow-Backed Requests:** Students post assignment briefs along with a defined maximum budget and target deadline. Funds matching the accepted proposal are securely locked in an escrow state, protecting both the student's capital and the tutor's development time.
* **Direct Workspace Communication:** Tutors and students chat in real-time rooms to coordinate homework requirements and clear up structural guidelines.
* **Protected Solution Delivery:** Tutors deliver final outputs through a secure, sandboxed rendering container. This prevents direct unauthorized file duplication prior to formal student approval and payment release.
* **Payment Execution:** Once the student reviews and approves the solution, the escrowed funds are released directly to the tutor’s wallet balance.

---

## 2. ApexKit Collections Architecture

The database schema is divided into seven core ApexKit collections. Each collection is represented as a structured schema containing field typings, validation rules, relational linkages, and access control policies.

```
       [courses] <───────────────+
           ▲                     │
           │ (courseId)          │ (courseId)
           │                     │
     [assignments] <───────┐     │
           ▲               │     │
           │ (assign_id)   │     │
           │               │     │
         [bids]            │     │
                           │     │
     [tutors_reviews] <────┤     │
                           │     │
        [payments] <───────┘     │
                                 │
     [users_profiles] <──────────+
```

### 1. `courses`
Represents the available university subjects and curriculum categories.
* **`id`** (`integer`, Primary Key, Auto-increment)
* **`code`** (`string`, Required, Unique, e.g., `CS 101`): Used for fast filtering and indexing.
* **`name`** (`string`, Required): Full title of the class.
* **`category`** (`select`, Required): Standardized department groups (`Computer Science`, `Mathematics`, `Engineering`, etc.).
* **`iconName`** (`string`, Required): Maps corresponding icons to the user interface.
* **`description`** (`text`, Required): Brief overview of topics covered.

### 2. `users_profiles`
Extends the standard system `users` credentials table with auxiliary profiles, wallet ledger balances, and tutoring credentials.
* **`id`** (`integer`, Primary Key, references `users.id`)
* **`email`** (`email`, Required)
* **`name`** (`string`, Required)
* **`role`** (`select`, Required): `'student'` or `'tutor'`.
* **`avatar`** (`url`, Optional): Path to profile icon.
* **`bio`** (`text`, Optional): Professional background statement (tutors only).
* **`expertise`** (`json`, Optional): Array of course code strings.
* **`rating`** (`number`, Optional, Defaults to `5.0`): Aggregated rating score.
* **`hourlyRate`** (`number`, Optional): Base cost per hour of live coaching.
* **`completedTasks`** (`number`, Optional, Defaults to `0`): Historical count of released escrow tasks.
* **`balance`** (`number`, Required): Represents available capital (student) or earned income (tutor).
* **`enrolledCourseIds`** (`json`, Optional): Array of courses the student has pinned for study.

### 3. `assignments`
Holds individual tutoring requests posted by students.
* **`id`** (`integer`, Primary Key, Auto-increment)
* **`title`** (`string`, Required): Explicit title of the homework problem.
* **`description`** (`text`, Required): Requirements, formatting rules, and questions.
* **`courseId`** (`relation`, Required, links to `courses`): Relational linkage.
* **`courseCode`** (`string`, Required): Redundant flat cache for querying optimization.
* **`budget`** (`number`, Required): Financial value allocated to the task.
* **`deadline`** (`date`, Required): Targeted completion date.
* **`studentId`** (`owner`, Required, links to `users_profiles`): The student who posted the request.
* **`studentName`** (`string`, Required)
* **`tutorId`** (`relation`, Optional, links to `users_profiles`): The tutor assigned after bid acceptance.
* **`tutorName`** (`string`, Optional)
* **`status`** (`select`, Required): Defaults to `'open'`. States: `'open'`, `'bidded'`, `'active'`, `'completed'`, `'paid'`, `'cancelled'`.
* **`fileUrls`** (`json`, Optional): Metadata list of attached support guidelines.
* **`solutionUrls`** (`json`, Optional): Metadata list of files uploaded by the tutor.

### 4. `bids`
Stores competitive proposals placed by tutors on open assignment requests.
* **`id`** (`integer`, Primary Key, Auto-increment)
* **`assignmentId`** (`relation`, Required, links to `assignments` with `cascade_on_target_delete = true`): Links to the target task.
* **`tutorId`** (`owner`, Required, links to `users_profiles`): The bidding tutor.
* **`tutorName`** (`string`, Required)
* **`tutorAvatar`** (`string`, Optional)
* **`tutorRating`** (`number`, Optional)
* **`amount`** (`number`, Required): Priced quote offered for the task.
* **`proposal`** (`text`, Required): Explanatory message regarding skills and approach.

### 5. `messages`
Maintains conversational lines between students and tutors within active workspaces.
* **`id`** (`integer`, Primary Key, Auto-increment)
* **`chatRoomId`** (`string`, Required): Formulated index string (e.g., `studentId_tutorId`).
* **`senderId`** (`relation`, Required, links to `users_profiles`): Message author.
* **`senderName`** (`string`, Required)
* **`text`** (`text`, Required)
* **`file`** (`json`, Optional): Attached documentation details (`name`, `url`, `size`, `mime`).

### 6. `tutors_reviews`
Tracks historical feedback left by students upon payment release.
* **`id`** (`integer`, Primary Key, Auto-increment)
* **`tutorId`** (`relation`, Required, links to `users_profiles`): Target tutor.
* **`studentName`** (`string`, Required): Author name.
* **`rating`** (`number`, Required): Evaluation value (1 to 5).
* **`comment`** (`text`, Required): Written evaluation feedback.
* **`assignmentTitle`** (`string`, Required)

### 7. `payments`
Maintains immutable financial ledgers for compliance and transaction auditing.
* **`id`** (`integer`, Primary Key, Auto-increment)
* **`assignmentId`** (`relation`, Required, links to `assignments`): Underlying contract.
* **`studentId`** (`relation`, Required, links to `users_profiles`): Buyer.
* **`tutorId`** (`relation`, Required, links to `users_profiles`): Seller.
* **`amount`** (`number`, Required): Transferred capital.
* **`status`** (`select`, Required): `'escrow'` (locked), `'released'` (credited to tutor), `'refunded'`.
* **`stripePaymentId`** (`string`, Required): Reference trace linking transaction to external processing gateways.

---

## 3. Real-Time Integration & Security

EduSolve uses the decoupled capabilities of ApexKit to enforce strict data isolation and performance optimizations:

* **Escrow Ledger Integrity:** Financial mutations are executed through transactional SQL queries. Deductions from a student's balance and creations of a transaction ledger under the `payments` collection must execute atomically.
* **Streaming Real-Time WS Updates:** Instant chat communication is powered by the `ApexKitRealtimeWSClient`. This client establishes a WebSocket connection to the backend and subscribes to events filtered by the active `chatRoomId`.
* **Row-Level Security (RLS) Pushdown:** ApexKit applies RLS policies over queries made through the `@apexkit/sdk`. For example, message collections enforce a policy where read access is restricted to authenticated users matching either the `senderId` or the workspace participant profiles.
* **Vector Embeddings (Search):** Assignment descriptions are automatically vectorized on insertion. When students look for similar homework guidelines, or when tutors look for relevant open markets, queries are processed using cosine-similarity matches over high-dimensional vector embeddings.