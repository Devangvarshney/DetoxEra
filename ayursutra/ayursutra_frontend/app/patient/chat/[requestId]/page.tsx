"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { Send, Lock } from "lucide-react";

export default function PatientChatPage() {
  const params = useParams();
  const requestId = params.requestId;
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const { data: chatData, isLoading } = useQuery({
    queryKey: ["chat", requestId],
    queryFn: async () => {
      const res = await api.get(`/chat/${requestId}`);
      return res.data;
    },
    enabled: !!user,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/chat/${requestId}`, { message });
      return res.data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["chat", requestId] });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatData?.messages]);

  if (!user) return null;
  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading chat...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-t-xl border border-ayur-border border-b-0 p-4 shadow-sm flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold font-outfit text-ayur-green-dark">Conversation with Practitioner</h1>
          <p className="text-xs text-ayur-muted">Request ID: {requestId}</p>
        </div>
        {!chatData?.is_active && (
          <div className="flex items-center gap-1 text-sm text-red-500 font-medium bg-red-50 px-3 py-1 rounded-full">
            <Lock className="w-4 h-4" /> Closed
          </div>
        )}
      </div>

      <div className="flex-1 bg-gray-50 border-x border-ayur-border overflow-y-auto p-4 flex flex-col gap-3">
        {chatData?.messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-ayur-muted italic">
            No messages yet. Say hello!
          </div>
        ) : (
          chatData?.messages.map((msg: any) => {
            const isMe = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end' : 'self-start'}`}>
                <div className={`p-3 rounded-2xl ${isMe ? 'bg-ayur-green text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                  {msg.message}
                </div>
                <span className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatData?.is_active ? (
        <form 
          className="bg-white p-3 border border-ayur-border rounded-b-xl shadow-sm flex gap-2 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) sendMutation.mutate();
          }}
        >
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-50"
            disabled={sendMutation.isPending}
          />
          <Button type="submit" disabled={!message.trim() || sendMutation.isPending} size="icon" className="rounded-full">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <div className="bg-gray-100 p-4 border border-ayur-border rounded-b-xl text-center text-sm text-gray-500">
          This chat is closed because the therapy schedule is completed.
        </div>
      )}
    </div>
  );
}
