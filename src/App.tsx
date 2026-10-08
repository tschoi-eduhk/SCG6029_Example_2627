import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  RefreshCw, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  User, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  Lightbulb,
  ThumbsUp,
  MessageCircle,
  Filter
} from 'lucide-react';

// The Google Apps Script Web App URL connected to your Google Sheet database
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwv7mApBghGRZ-6wx1nUsfGLflT7E3VMWLUMQRRKjw1pptpE5Za46xAw_9VnNS3dZBaaA/exec";
const MAX_CHARS = 500;

export default function App() {
  const [studentId, setStudentId] = useState('');
  const [comment, setComment] = useState('');
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'questions', 'feedback'
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    fetchApprovedComments();
  }, []);

  const fetchApprovedComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Reverse so the newest posts appear at the top
        setFeed(data.reverse());
      } else {
        setFeed([]);
      }
    } catch (error) {
      console.error("Failed to load comments:", error);
      setStatus({ 
        type: 'error', 
        message: 'Could not refresh discussion feed. Please check your internet connection.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim() || !comment.trim()) {
      setStatus({ type: 'error', message: 'Please provide both your Student ID and your feedback or question.' });
      return;
    }

    if (comment.length > MAX_CHARS) {
      setStatus({ type: 'error', message: `Comments cannot exceed ${MAX_CHARS} characters.` });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'info', message: 'Submitting your post to the teacher...' });

    try {
      // POST request using text/plain header to prevent CORS preflight blocks from Google Apps Script
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'text/plain' 
        },
        body: JSON.stringify({
          studentId: studentId.trim(),
          comment: comment.trim()
        })
      });

      setStatus({ 
        type: 'success', 
        message: 'Feedback submitted successfully! It will appear in the live board above once approved in the Google Sheet.' 
      });
      
      setComment('');
      // Save Student ID in local state or keep filled for continuous posting
      
      // Auto-dismiss status message after 8 seconds
      setTimeout(() => setStatus({ type: '', message: '' }), 8000);
      
    } catch (error) {
      console.error("Submission error:", error);
      setStatus({ 
        type: 'error', 
        message: 'Failed to send your feedback. Please try again in a few moments.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = (index) => {
    setLikedPosts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const filteredFeed = useMemo(() => {
    return feed.filter(item => {
      const matchesSearch = 
        (item.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.comment || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'questions') {
        return item.comment.includes('?') || item.comment.toLowerCase().includes('how') || item.comment.toLowerCase().includes('what') || item.comment.toLowerCase().includes('why');
      }
      if (activeFilter === 'feedback') {
        return !item.comment.includes('?');
      }

      return true;
    });
  }, [feed, searchQuery, activeFilter]);

  const formatTimestamp = (rawTimestamp) => {
    if (!rawTimestamp) return 'Recently';
    try {
      const date = new Date(rawTimestamp);
      if (isNaN(date.getTime())) return String(rawTimestamp);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased pb-16">
      
      {}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
              <MessageSquare size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                Class Feedback Board
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Live Community Hub & Real-time Q&A
              </p>
            </div>
          </div>

          <button
            onClick={fetchApprovedComments}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all disabled:opacity-50 active:scale-95"
            title="Refresh feed from Google Sheet"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-600" : ""} />
            <span className="hidden sm:inline">Refresh Feed</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8 space-y-8">

        {}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 overflow-hidden">
          
          {/* Panel Header & Controls */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-amber-500" />
                  <h2 className="text-xl font-extrabold text-slate-900">
                    Live Discussion Board
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing posts approved by your teacher.
                </p>
              </div>

              {/* Counter Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold self-start sm:self-auto border border-blue-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {feed.length} Approved Post{feed.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Search and Category Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by student ID or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => setActiveFilter('questions')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === 'questions'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <HelpCircle size={14} />
                  Questions
                </button>
                <button
                  onClick={() => setActiveFilter('feedback')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeFilter === 'feedback'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Lightbulb size={14} />
                  Feedback
                </button>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                <RefreshCw size={36} className="animate-spin text-blue-500" />
                <p className="text-sm font-medium">Fetching posts from Google Sheet...</p>
              </div>
            ) : filteredFeed.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                  <MessageCircle size={32} />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {searchQuery || activeFilter !== 'all' ? 'No matching posts found' : 'No approved posts yet'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || activeFilter !== 'all' 
                    ? 'Try adjusting your search terms or filter settings.' 
                    : 'Be the first to submit a thought or question using the form below!'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFeed.map((item, idx) => {
                  const isQuestion = item.comment.includes('?');
                  const isLiked = likedPosts[idx];

                  return (
                    <article 
                      key={idx}
                      className="group bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                            isQuestion ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.studentId ? item.studentId.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">
                                {item.studentId || 'Anonymous'}
                              </span>
                              {isQuestion ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                  <HelpCircle size={10} /> Question
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                  <Lightbulb size={10} /> Thought
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Clock size={12} />
                              <span>{formatTimestamp(item.timestamp)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Local Reaction Button */}
                        <button
                          onClick={() => toggleLike(idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                            isLiked 
                              ? 'bg-rose-50 text-rose-600 border border-rose-200 font-bold' 
                              : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          <ThumbsUp size={13} className={isLiked ? "fill-rose-500 stroke-rose-500" : ""} />
                          <span>{isLiked ? 'Helpful (1)' : 'Helpful'}</span>
                        </button>
                      </div>

                      <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap pl-1 sm:pl-13">
                        {item.comment}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>


        {}
        <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Send size={20} className="text-blue-600" />
              Submit Feedback or Question
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your submission will be stored in the teacher's spreadsheet and reviewed before publishing.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Student ID Input */}
            <div className="space-y-1.5">
              <label htmlFor="studentId" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Student ID or Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="studentId"
                  type="text"
                  placeholder="e.g. S-10492 or Alex"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={40}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Comment Area */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="comment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Opinion / Feedback / Question <span className="text-rose-500">*</span>
                </label>
                <span className={`text-[11px] font-semibold ${
                  comment.length > MAX_CHARS - 50 ? 'text-amber-600' : 'text-slate-400'
                }`}>
                  {comment.length}/{MAX_CHARS}
                </span>
              </div>
              <textarea
                id="comment"
                placeholder="Type your question or feedback here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={isSubmitting}
                maxLength={MAX_CHARS}
                rows={4}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-normal leading-relaxed resize-y"
              />
            </div>

            {/* Status Notifications */}
            {status.message && (
              <div className={`p-4 rounded-xl flex items-start gap-3 text-xs sm:text-sm font-medium transition-all ${
                status.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {status.type === 'error' && <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />}
                {status.type === 'success' && <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />}
                {status.type === 'info' && <RefreshCw size={18} className="shrink-0 mt-0.5 text-blue-600 animate-spin" />}
                <span>{status.message}</span>
              </div>
            )}

            {/* Action Button */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !studentId.trim() || !comment.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </section>

      </main>
    </div>
  );
}