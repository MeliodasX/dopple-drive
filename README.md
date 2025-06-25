<h1 align="center">
    Dopple Drive - A Modern Google Drive Clone
</h1>

<p align="center">
    <img src="./readme/dopple-drive.svg">
</p>

<p align="center">
  A feature-rich, scalable, and performant clone of Google Drive built with a modern, production-grade tech stack.
</p>

---

## ✨ Features

This project goes beyond a simple clone, implementing robust, real-world architectural patterns for a seamless and
scalable user experience.

### Core Functionality

* **🔐 Secure User Authentication:** Full sign-up, sign-in, and session management powered by Clerk.
* **🗂️ Complete File & Folder Management:**
    * Create, rename, move, and delete files and folders.
    * Automatic conflict resolution: creating a file or folder with a duplicate name automatically appends a number (
      e.g., `report (1).pdf`), preventing accidental overwrites.
* **⚡ Blazing-Fast Navigation:**
    * **Infinite Scrolling:** Effortlessly browse through hundreds or thousands of files and folders without pagination
      clicks.
    * **Lazy-Loaded Tree View:** The "Move to" modal features a highly performant folder tree that loads nested content
      on demand.
    * **Smart Collapsible Breadcrumbs:** An intuitive breadcrumb system for both desktop and mobile that elegantly
      collapses long paths to keep the UI clean.
* **🚀 Advanced Upload/Download System:**
    * **Direct-to-S3 Uploads:** Files are uploaded directly to S3, bypassing server limitations. This allows for uploads
      larger than the typical 4.5MB serverless function limit.
    * **Background Processing:** Start an upload or download and continue browsing. The process runs independently of
      any single component or modal.
    * **Real-time Progress Toasts:** Application-wide toasts (powered by Sonner) show the real-time progress of every
      concurrent upload and download.
    * **Cancellable Actions:** Users can cancel any in-progress upload or download directly from the toast notification.
* **📄 Rich File Previews:** An immersive, full-screen preview modal for common file types, including images, videos,
  audio, and PDFs.
* **📱 Fully Responsive UI:** A clean and modern interface built with Tailwind CSS and ShadCN UI that provides a seamless
  experience from mobile to desktop.

---

## 🛠️ Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Backend:** Next.js API Routes
* **Database:** PostgreSQL with Drizzle ORM
* **File Storage:** AWS S3
* **Authentication:** Clerk
* **UI:** Tailwind CSS, ShadCN UI
* **State Management:**
    * **Zustand** for minimal global state (e.g., current directory).
    * **TanStack Query (React Query)** for all server state management, caching, and mutations.
* **UI Components:** `lucide-react` for icons, `sonner` for toasts.

---

## 🏗️ Key Architectural Decisions & Highlights

This project was built with scalability and performance as top priorities.

1. **Direct-to-S3 Uploads via Pre-signed URLs:** To overcome serverless function payload limits (~4.5MB), the
   application uses a secure, three-step process for uploads. The client requests a pre-signed URL from the backend,
   uploads the file directly to S3, and then notifies the backend upon completion. This is a production-grade pattern
   for handling large file uploads efficiently.

2. **Cursor-Based Pagination:** Instead of traditional offset-based pagination which degrades in performance on large
   datasets, all file/folder lists use cursor-based pagination. This ensures that fetching data remains fast and
   efficient, no matter how many items a user has.

3. **Materialized Path for Hierarchy:** The database stores a materialized `path` for every item. This allows for
   extremely efficient hierarchical operations, such as soft-deleting a folder and all of its thousands of descendants
   in a single, fast database query.

4. **Decoupled Background Services:** All upload and download logic is handled by standalone "services" that are
   decoupled from the UI. This allows these long-running tasks to continue in the background, independent of component
   lifecycles, providing a smoother user experience.

---

## 🛑 Limitations & Future Work

* **Upload Size Limit:** While the architecture supports large files, a client-side limit of **100 MB** per file is
  currently enforced to save S3 storage costs (S3 Free Tier only allows 5 GB).
* **Folder Uploads:** The UI currently does not support uploading entire folders via drag-and-drop; users must select
  the files within the folder.
* **Sharing:** File and folder sharing functionality is not yet implemented.
* **Trash/Restore:** While items are soft-deleted on the backend, the UI for a "Trash" can and restoring items has not
  been built.

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dopple-drive.git
   cd dopple-drive
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Set up environment variables:**
    * Create a `.env.local` file by copying the `.env.example` file.
    * Fill in the required credentials for your database, AWS S3, and Clerk.

4. **Run database migrations:**
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Visit [here](https://dopple.meliodasx.com) to see the application in action!