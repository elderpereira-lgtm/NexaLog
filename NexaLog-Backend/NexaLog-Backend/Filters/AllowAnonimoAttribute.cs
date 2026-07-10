using System;

namespace NexaLog_Backend.Filters
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = false)]
    public class AllowAnonimoAttribute : Attribute
    {
    }
}