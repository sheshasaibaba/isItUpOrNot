import React, { useState } from 'react';
import { Globe, CheckCircle, XCircle, Loader, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export default function WebsiteStatusChecker() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const popularSitesLeft = [
    { name: 'Google', url: 'google.com' },
    { name: 'Facebook', url: 'facebook.com' },
    { name: 'YouTube', url: 'youtube.com' },
    { name: 'Twitter', url: 'twitter.com' },
  ];

  const popularSitesRight = [
    { name: 'Amazon', url: 'amazon.com' },
    { name: 'Netflix', url: 'netflix.com' },
    { name: 'LinkedIn', url: 'linkedin.com' },
    { name: 'GitHub', url: 'github.com' },
  ];

  const validateUrl = (urlString) => {
    try {
      if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
        urlString = 'https://' + urlString;
      }
      new URL(urlString);
      return urlString;
    } catch (e) {
      return null;
    }
  };

  const checkWebsite = async (urlOverride = null) => {
    const targetUrl = urlOverride || url;
    
    if (!targetUrl.trim()) {
      setError('Please enter a website URL');
      return;
    }

    const validatedUrl = validateUrl(targetUrl.trim());
    if (!validatedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    if (urlOverride) {
      setUrl(urlOverride);
    }

    setLoading(true);
    setError('');
    setStatus(null);

    const backendUrl = "https://hsd3th6mthl6l33lyu5atx6r4q0qhyqt.lambda-url.us-east-1.on.aws/";

    try {
      const payload = {
        url: validatedUrl
      };

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const result = {
        url: validatedUrl,
        status: data.status || (data.is_up ? 'UP' : 'DOWN'),
        responseTime: data.response_time || data.responseTime || 0,
        timestamp: new Date().toISOString(),
        statusCode: data.status_code || data.statusCode,
        message: data.message || ''
      };

      setStatus(result);
      
      setHistory(prev => [{
        ...result,
        id: Date.now()
      }, ...prev.slice(0, 4)]);

    } catch (err) {
      setError(`Failed to check website: ${err.message}. Please try again.`);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkWebsite();
    }
  };

  const getStatusColor = (statusValue) => {
    return statusValue === 'UP' ? 'text-green-500' : 'text-red-500';
  };

  const getStatusBgColor = (statusValue) => {
    return statusValue === 'UP' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const QuickLinkButton = ({ site }) => (
    <button
      onClick={() => checkWebsite(site.url)}
      disabled={loading}
      className="w-full bg-white p-4 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 border border-gray-100 group text-left"
    >
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700">{site.name}</span>
        <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </div>
      <span className="text-xs text-gray-400 mt-1 block truncate">{site.url}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow flex gap-8 items-start justify-center">
        
        <div className="hidden xl:flex flex-col gap-4 w-64 pt-20">
          <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2 pl-2">Popular Sites</h3>
          {popularSitesLeft.map((site) => (
            <QuickLinkButton key={site.name} site={site} />
          ))}
        </div>

        <div className="flex-1 max-w-3xl">
          <div className="text-center mb-10 pt-8">
            <div className="flex items-center justify-center mb-4">
              <Globe className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-3">
              Is It Down?
            </h1>
            <p className="text-gray-600 text-lg">
              Check if any website is up or down from our cloud servers
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter website (e.g., google.com)"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  disabled={loading}
                />
                <button
                  onClick={() => checkWebsite()}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </button>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {status && (
              <div className={`mt-6 p-6 rounded-xl border-2 ${getStatusBgColor(status.status)} transition-all`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {status.status === 'UP' ? (
                      <CheckCircle className="w-10 h-10 text-green-500" />
                    ) : (
                      <XCircle className="w-10 h-10 text-red-500" />
                    )}
                    <div>
                      <h3 className={`text-2xl font-bold ${getStatusColor(status.status)}`}>
                        {status.status === 'UP' ? "It's UP! 🎉" : "It's DOWN 😞"}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{status.url}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Response Time: {status.responseTime}ms</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Checked: {new Date(status.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Checks</h2>
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3">
                      {item.status === 'UP' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{item.url}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.status === 'UP' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden xl:flex flex-col gap-4 w-64 pt-20">
          <h3 className="text-gray-400 uppercase text-xs font-bold tracking-wider mb-2 pl-2">Trending</h3>
          {popularSitesRight.map((site) => (
            <QuickLinkButton key={site.name} site={site} />
          ))}
        </div>

      </div>
      
      <div className="py-6 text-center text-gray-500 text-sm">
        <p>Checks are performed from AWS cloud servers for accurate global results</p>
      </div>
    </div>
  );
}