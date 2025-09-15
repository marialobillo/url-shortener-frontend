'use client';

import { useState } from 'react'
import { LinkIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline'

const API_BASE_URL = 'https://yurajazpsg.execute-api.eu-west-3.amazonaws.com/Prod';

interface ShortenResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  const shortenUrl = async (event: React.FormEvent) => {
    event?.preventDefault()

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (include http:// )');
      return;
    }

    setLoading(true);
    setError('');
    setShortUrl('');

    try {
      const response = await fetch(`${API_BASE_URL}/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to shorten URL');
      }

      const data: ShortenResponse = await response.json();
      setShortUrl(data.shortUrl);
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  }

  const reset = () => {
    setUrl('');
    setShortUrl('');
    setError('');
    setCopied(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <LinkIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">URL Shortener</h1>
          <p className="text-gray-600">Transform long URLs into short, shareable links</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {!shortUrl ? (
            /* Input Form */
            <form onSubmit={shortenUrl} className="space-y-4">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your URL
                </label>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/very-long-url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Shortening...
                  </div>
                ) : (
                  'Shorten URL'
                )}
              </button>
            </form>
          ) : (
            /* Success Result */
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <CheckIcon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">URL Shortened!</h3>
                <p className="text-gray-600 text-sm">Your short URL is ready to use</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  SHORT URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 bg-transparent text-indigo-600 font-medium focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ClipboardIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  ORIGINAL URL
                </label>
                <p className="text-gray-700 text-sm break-all">{url}</p>
              </div>

              <button
                onClick={reset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Shorten Another URL
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Built with Next.js & AWS Serverless
          </p>
        </div>
      </div>
    </div>
  );
}
