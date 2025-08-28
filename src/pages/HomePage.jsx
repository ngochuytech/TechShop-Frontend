import Header from "../components/Header/Header";
import MainContent from "../components/MainContent/MainContent";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main content */}
      <div className="flex-1 pt-10">
        <MainContent />
      </div>
    </div>
  );
}
